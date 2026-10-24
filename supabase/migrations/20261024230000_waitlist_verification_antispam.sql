-- Waitlist verification and abuse-resistance foundation.
-- Existing rows are deliberately classified as legacy, never silently verified.
alter table public.waitlist
  add column if not exists verification_status text not null default 'legacy'
    check (verification_status in ('legacy', 'pending', 'verified', 'flagged')),
  add column if not exists verified_at timestamptz,
  add column if not exists verification_requested_at timestamptz;

-- Existing rows are checked for case-insensitive duplicates before this migration is applied.
-- Keep the legacy constraint until the case-insensitive index is in place.
create unique index if not exists waitlist_unique_email_per_page_ci
  on public.waitlist (landing_page_id, lower(email));

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;

create table if not exists private.waitlist_verification_tokens (
  token_hash text primary key,
  waitlist_id uuid not null references public.waitlist(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists waitlist_verification_tokens_signup_idx
  on private.waitlist_verification_tokens(waitlist_id, created_at desc);

create table if not exists private.waitlist_rate_limits (
  key_hash text not null,
  window_start timestamptz not null,
  hits integer not null default 0 check (hits >= 0),
  primary key (key_hash, window_start)
);

create or replace function public.begin_waitlist_verification(
  p_slug text,
  p_email text,
  p_token_hash text,
  p_ip_key_hash text,
  p_email_key_hash text,
  p_challenge_passed boolean default false
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_page_id uuid;
  v_signup_id uuid;
  v_status text;
  v_window timestamptz := date_trunc('hour', now());
  v_ip_hits integer;
  v_email_hits integer;
begin
  delete from private.waitlist_rate_limits where window_start < now() - interval '48 hours';
  delete from private.waitlist_verification_tokens
    where expires_at < now() - interval '2 days'
       or (used_at is not null and used_at < now() - interval '2 days');

  if p_slug is null or length(p_slug) > 180
     or p_email is null or length(p_email) > 254
     or p_token_hash is null or length(p_token_hash) > 128
     or p_ip_key_hash is null or length(p_ip_key_hash) > 128
     or p_email_key_hash is null or length(p_email_key_hash) > 128 then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;

  insert into private.waitlist_rate_limits(key_hash, window_start, hits)
  values (p_ip_key_hash, v_window, 1)
  on conflict (key_hash, window_start) do update
    set hits = private.waitlist_rate_limits.hits + 1
  returning hits into v_ip_hits;

  insert into private.waitlist_rate_limits(key_hash, window_start, hits)
  values (p_email_key_hash, v_window, 1)
  on conflict (key_hash, window_start) do update
    set hits = private.waitlist_rate_limits.hits + 1
  returning hits into v_email_hits;

  if v_ip_hits > 12 or v_email_hits > 5 then
    return jsonb_build_object('ok', false, 'reason', 'rate_limited');
  end if;
  if (v_ip_hits > 5 or v_email_hits > 2) and not coalesce(p_challenge_passed, false) then
    return jsonb_build_object('ok', false, 'reason', 'challenge_required');
  end if;

  select id into v_page_id
  from public.landing_pages
  where slug = p_slug and status = 'published'
  limit 1;

  if v_page_id is null then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;

  select id, verification_status into v_signup_id, v_status
  from public.waitlist
  where landing_page_id = v_page_id and lower(email) = lower(trim(p_email))
  limit 1
  for update;

  if v_signup_id is not null and v_status = 'verified' then
    return jsonb_build_object('ok', true, 'status', 'verified', 'signup_id', v_signup_id, 'page_id', v_page_id);
  end if;

  if v_signup_id is null then
    insert into public.waitlist(landing_page_id, email, verification_status, verification_requested_at)
    values (v_page_id, lower(trim(p_email)), 'pending', now())
    returning id into v_signup_id;
  else
    update public.waitlist
      set email = lower(trim(p_email)),
          verification_status = 'pending',
          verified_at = null,
          verification_requested_at = now()
    where id = v_signup_id;
  end if;

  -- Invalidate older links for this signup before issuing a new one.
  update private.waitlist_verification_tokens
    set used_at = coalesce(used_at, now())
    where waitlist_id = v_signup_id and used_at is null;

  insert into private.waitlist_verification_tokens(token_hash, waitlist_id, expires_at)
  values (p_token_hash, v_signup_id, now() + interval '30 minutes');

  return jsonb_build_object('ok', true, 'status', 'pending', 'signup_id', v_signup_id, 'page_id', v_page_id);
end;
$$;

create or replace function public.verify_waitlist_email(p_token_hash text)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_signup_id uuid;
  v_page_id uuid;
  v_slug text;
begin
  if p_token_hash is null or length(p_token_hash) > 128 then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;

  select t.waitlist_id into v_signup_id
  from private.waitlist_verification_tokens t
  where t.token_hash = p_token_hash and t.used_at is null and t.expires_at > now()
  for update;

  if v_signup_id is null then
    return jsonb_build_object('ok', false, 'reason', 'expired_or_used');
  end if;

  update private.waitlist_verification_tokens
    set used_at = now()
    where token_hash = p_token_hash and used_at is null;

  update public.waitlist
    set verification_status = 'verified', verified_at = now()
    where id = v_signup_id and verification_status = 'pending'
    returning landing_page_id into v_page_id;

  if v_page_id is null then
    return jsonb_build_object('ok', false, 'reason', 'not_pending');
  end if;

  select slug into v_slug from public.landing_pages where id = v_page_id;
  return jsonb_build_object('ok', true, 'signup_id', v_signup_id, 'page_id', v_page_id, 'slug', v_slug);
end;
$$;

create or replace function public.get_waitlist_membership_status(p_signup_id uuid, p_page_id uuid)
returns text
language sql
security definer
set search_path = pg_catalog, public
as $$
  select verification_status
  from public.waitlist
  where id = p_signup_id and landing_page_id = p_page_id
    and verification_status in ('pending', 'verified', 'legacy', 'flagged')
  limit 1;
$$;

revoke all on function public.begin_waitlist_verification(text, text, text, text, text, boolean) from public, anon, authenticated;
revoke all on function public.verify_waitlist_email(text) from public, anon, authenticated;
revoke all on function public.get_waitlist_membership_status(uuid, uuid) from public, anon, authenticated;
grant execute on function public.begin_waitlist_verification(text, text, text, text, text) to service_role;
grant execute on function public.verify_waitlist_email(text) to service_role;
grant execute on function public.get_waitlist_membership_status(uuid, uuid) to service_role;

-- Remove expired rate-limit windows and stale/used verification tokens on a rolling basis
-- from the API route; no extension/cron setup is required for this first release.
