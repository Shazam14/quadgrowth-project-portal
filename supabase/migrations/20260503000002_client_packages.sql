-- Phase 1B sub-8 — Package & Account: single-row-per-client plan/billing/renewal record.
-- Depends on: public.clients, public.client_assignments, public.get_my_role(),
-- public.is_admin(), public.my_client_id(), public.touch_updated_at()
-- (all from 20260426000001_init.sql).

-- 1. Enum --------------------------------------------------------------

do $$ begin
  create type public.package_tier as enum ('starter', 'growth', 'scale');
exception when duplicate_object then null;
end $$;

-- 2. Table -------------------------------------------------------------

create table if not exists public.client_packages (
  client_id uuid primary key references public.clients(id) on delete cascade,
  plan_tier public.package_tier not null default 'starter',
  monthly_value numeric(10,2),
  billing_contact_name text,
  billing_contact_email text,
  renewal_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists touch_client_packages on public.client_packages;
create trigger touch_client_packages
  before update on public.client_packages
  for each row execute function public.touch_updated_at();

-- 3. RLS ---------------------------------------------------------------

alter table public.client_packages enable row level security;

-- Clients see their own package.
drop policy if exists "client_packages_client_read_own" on public.client_packages;
create policy "client_packages_client_read_own" on public.client_packages
  for select
  using (
    public.get_my_role() = 'client'
    and client_id = public.my_client_id()
  );

-- CGMs see packages for clients they're assigned to (read-only — admin owns writes).
drop policy if exists "client_packages_cgm_read_assigned" on public.client_packages;
create policy "client_packages_cgm_read_assigned" on public.client_packages
  for select
  using (
    public.get_my_role() = 'cgm'
    and client_id in (
      select client_id from public.client_assignments where cgm_id = auth.uid()
    )
  );

-- Admin: full control (only writer in v1).
drop policy if exists "client_packages_admin_all" on public.client_packages;
create policy "client_packages_admin_all" on public.client_packages
  for all
  using (public.is_admin())
  with check (public.is_admin());
