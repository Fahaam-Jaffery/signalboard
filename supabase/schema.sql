create extension if not exists pgcrypto;
create table if not exists public.profiles(id uuid primary key references auth.users(id) on delete cascade,full_name text not null default '',goals text not null default '',skills text not null default '',interests text not null default '',created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.landing_pages(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,slug text not null unique,title text not null,headline text not null,content jsonb not null default '{}'::jsonb,idea_data jsonb not null default '{}'::jsonb,status text not null default 'published' check(status in('draft','published','archived')),created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.waitlist(id uuid primary key default gen_random_uuid(),landing_page_id uuid not null references public.landing_pages(id) on delete cascade,email text not null check(char_length(email)<=254),created_at timestamptz not null default now(),constraint waitlist_unique_email_per_page unique(landing_page_id,email));
create index if not exists landing_pages_user_created_idx on public.landing_pages(user_id,created_at desc);create index if not exists waitlist_page_idx on public.waitlist(landing_page_id);
alter table public.profiles enable row level security;alter table public.landing_pages enable row level security;alter table public.waitlist enable row level security;
drop policy if exists "Users can read own profile" on public.profiles;create policy "Users can read own profile" on public.profiles for select to authenticated using(auth.uid()=id);
drop policy if exists "Users can insert own profile" on public.profiles;create policy "Users can insert own profile" on public.profiles for insert to authenticated with check(auth.uid()=id);
drop policy if exists "Users can update own profile" on public.profiles;create policy "Users can update own profile" on public.profiles for update to authenticated using(auth.uid()=id) with check(auth.uid()=id);
drop policy if exists "Users can read own landing pages" on public.landing_pages;create policy "Users can read own landing pages" on public.landing_pages for select to authenticated using(auth.uid()=user_id);
drop policy if exists "Users can create own landing pages" on public.landing_pages;create policy "Users can create own landing pages" on public.landing_pages for insert to authenticated with check(auth.uid()=user_id);
drop policy if exists "Users can update own landing pages" on public.landing_pages;create policy "Users can update own landing pages" on public.landing_pages for update to authenticated using(auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists "Public can read published landing pages" on public.landing_pages;create policy "Public can read published landing pages" on public.landing_pages for select to anon,authenticated using(status='published');
drop policy if exists "Page owners can view waitlist" on public.waitlist;create policy "Page owners can view waitlist" on public.waitlist for select to authenticated using(exists(select 1 from public.landing_pages lp where lp.id=landing_page_id and lp.user_id=auth.uid()));
drop policy if exists "Anyone can join a published page waitlist" on public.waitlist;create policy "Anyone can join a published page waitlist" on public.waitlist for insert to anon,authenticated with check(exists(select 1 from public.landing_pages lp where lp.id=landing_page_id and lp.status='published'));
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$ begin insert into public.profiles(id,full_name) values(new.id,coalesce(new.raw_user_meta_data->>'full_name','')) on conflict(id) do nothing;return new;end;$$;
drop trigger if exists on_auth_user_created on auth.users;create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Product-creation workspaces
create table if not exists public.product_projects (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 name text not null check (char_length(name) between 1 and 100),
 description text not null default '' check (char_length(description) <= 2000),
 audience text not null default '' check (char_length(audience) <= 500),
 category text not null default 'Web app' check (char_length(category) <= 100),
 stage text not null default 'discovery' check (stage in ('discovery','blueprint','prototype','launch')),
 workspace jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists product_projects_user_updated_idx on public.product_projects(user_id, updated_at desc);
alter table public.product_projects enable row level security;
drop policy if exists "Users can read own product projects" on public.product_projects;
create policy "Users can read own product projects" on public.product_projects for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users can create own product projects" on public.product_projects;
create policy "Users can create own product projects" on public.product_projects for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users can update own product projects" on public.product_projects;
create policy "Users can update own product projects" on public.product_projects for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users can delete own product projects" on public.product_projects;
create policy "Users can delete own product projects" on public.product_projects for delete to authenticated using ((select auth.uid()) = user_id);
grant select, insert, update, delete on table public.product_projects to authenticated;

-- Table privileges required by the owner-scoped RLS policies above.
grant select, insert, update on table public.landing_pages to authenticated;
grant select on table public.landing_pages to anon;

grant delete on table public.landing_pages to authenticated;

-- Remove unnecessary table-level privileges; row-level security does not protect against TRUNCATE.
revoke truncate, references, trigger on table public.landing_pages from anon, authenticated;

-- Allow authenticated users to delete only their own landing pages.
drop policy if exists "Users can delete own landing pages" on public.landing_pages;
create policy "Users can delete own landing pages" on public.landing_pages for delete to authenticated using (auth.uid() = user_id);
