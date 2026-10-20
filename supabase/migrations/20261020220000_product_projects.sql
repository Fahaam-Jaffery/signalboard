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
