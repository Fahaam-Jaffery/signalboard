-- Account-authenticated waitlist subscriptions.
-- Existing waitlist rows are preserved and remain legacy unless safely linked to a confirmed account.
alter table public.waitlist
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists verification_status text not null default 'legacy'
    check (verification_status in ('legacy', 'pending', 'verified', 'flagged')),
  add column if not exists verified_at timestamptz,
  add column if not exists verification_requested_at timestamptz;

-- Keep existing subscribers, but link records only when a confirmed Supabase account owns the same email.
update public.waitlist w
set user_id = u.id,
    verification_status = 'verified',
    verified_at = coalesce(w.verified_at, now())
from auth.users u
where w.user_id is null
  and u.email_confirmed_at is not null
  and lower(trim(w.email)) = lower(trim(u.email));

-- Uniqueness is now based on the authenticated identity, not a visitor-supplied email.
drop index if exists public.waitlist_unique_email_per_page;
drop index if exists public.waitlist_unique_email_per_page_ci;
create unique index if not exists waitlist_unique_user_per_page
  on public.waitlist (landing_page_id, user_id)
  where user_id is not null;

create index if not exists waitlist_user_idx on public.waitlist(user_id) where user_id is not null;

-- This narrowly scoped helper lets RLS check confirmation status from auth.users.
create or replace function public.is_confirmed_signalboard_user()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, auth
as $$
  select exists (
    select 1 from auth.users
    where id = (select auth.uid())
      and email_confirmed_at is not null
  );
$$;
revoke all on function public.is_confirmed_signalboard_user() from public, anon;
grant execute on function public.is_confirmed_signalboard_user() to authenticated;

alter table public.waitlist enable row level security;

-- Remove anonymous signup access; only a confirmed account can join.
drop policy if exists "Anyone can join a published page waitlist" on public.waitlist;
drop policy if exists "Authenticated users can join a published page waitlist" on public.waitlist;
create policy "Authenticated users can join a published page waitlist"
on public.waitlist
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and public.is_confirmed_signalboard_user()
  and lower(email) = lower((select auth.jwt() ->> 'email'))
  and verification_status = 'verified'
  and verified_at is not null
  and exists (
    select 1 from public.landing_pages lp
    where lp.id = landing_page_id and lp.status = 'published'
  )
);

drop policy if exists "Users can view their own waitlist memberships" on public.waitlist;
create policy "Users can view their own waitlist memberships"
on public.waitlist
for select
to authenticated
using (user_id = (select auth.uid()));

-- No public updates/deletes are granted by this migration. Existing page-owner read access is preserved.
