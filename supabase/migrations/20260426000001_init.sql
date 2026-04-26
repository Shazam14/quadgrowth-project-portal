-- QuadGrowth portal — initial schema
-- Run in Supabase SQL editor (Dashboard → SQL → New query → paste → Run).
-- Idempotent-ish: drop existing if re-running, but a fresh project won't have anything yet.

-- ---------------------------------------------------------------------------
-- 1. Role enum
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.app_role as enum ('client', 'cgm', 'admin');
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Tables
-- ---------------------------------------------------------------------------

-- Practices QuadGrowth services
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);

-- 1:1 with auth.users; client_id set only when role = 'client'
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'client',
  full_name text,
  client_id uuid references public.clients(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- m:n CGM↔client
create table if not exists public.client_assignments (
  id uuid primary key default gen_random_uuid(),
  cgm_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  assigned_by uuid references public.profiles(id),
  unique (cgm_id, client_id)
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_client_id on public.profiles(client_id);
create index if not exists idx_assignments_cgm on public.client_assignments(cgm_id);
create index if not exists idx_assignments_client on public.client_assignments(client_id);

-- ---------------------------------------------------------------------------
-- 3. Auto-create profile on signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    'client',  -- default; admin promotes to cgm or admin via /admin UI
    nullif(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 4. Helper functions (SECURITY DEFINER avoids RLS recursion on profiles)
-- ---------------------------------------------------------------------------
create or replace function public.get_my_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  )
$$;

create or replace function public.my_client_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select client_id from public.profiles where id = auth.uid()
$$;

-- ---------------------------------------------------------------------------
-- 5. Enable RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.client_assignments enable row level security;

-- ---------------------------------------------------------------------------
-- 6. Profiles policies
-- ---------------------------------------------------------------------------
drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read"
  on public.profiles for select
  using (id = auth.uid());

drop policy if exists "profiles_admin_read_all" on public.profiles;
create policy "profiles_admin_read_all"
  on public.profiles for select
  using (public.is_admin());

drop policy if exists "profiles_cgm_read_assigned_clients" on public.profiles;
create policy "profiles_cgm_read_assigned_clients"
  on public.profiles for select
  using (
    public.get_my_role() = 'cgm'
    and client_id in (
      select client_id from public.client_assignments where cgm_id = auth.uid()
    )
  );

drop policy if exists "profiles_self_update_no_role_change" on public.profiles;
create policy "profiles_self_update_no_role_change"
  on public.profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and (role = public.get_my_role() or public.is_admin())
  );

drop policy if exists "profiles_admin_update_any" on public.profiles;
create policy "profiles_admin_update_any"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 7. Clients policies
-- ---------------------------------------------------------------------------
drop policy if exists "clients_admin_all" on public.clients;
create policy "clients_admin_all"
  on public.clients for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "clients_cgm_read_assigned" on public.clients;
create policy "clients_cgm_read_assigned"
  on public.clients for select
  using (
    public.get_my_role() = 'cgm'
    and id in (
      select client_id from public.client_assignments where cgm_id = auth.uid()
    )
  );

drop policy if exists "clients_client_read_own" on public.clients;
create policy "clients_client_read_own"
  on public.clients for select
  using (
    public.get_my_role() = 'client'
    and id = public.my_client_id()
  );

-- ---------------------------------------------------------------------------
-- 8. Client assignments policies
-- ---------------------------------------------------------------------------
drop policy if exists "assignments_admin_all" on public.client_assignments;
create policy "assignments_admin_all"
  on public.client_assignments for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "assignments_cgm_read_own" on public.client_assignments;
create policy "assignments_cgm_read_own"
  on public.client_assignments for select
  using (cgm_id = auth.uid());

drop policy if exists "assignments_client_read_own" on public.client_assignments;
create policy "assignments_client_read_own"
  on public.client_assignments for select
  using (
    public.get_my_role() = 'client'
    and client_id = public.my_client_id()
  );

-- ---------------------------------------------------------------------------
-- 9. updated_at trigger on profiles
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();
