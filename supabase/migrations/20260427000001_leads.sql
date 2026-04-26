-- Phase 1B sub-2 — Live Lead Feed: leads table + RLS.
-- Depends on: public.clients, public.client_assignments,
-- public.get_my_role(), public.is_admin(), public.my_client_id(),
-- public.touch_updated_at() (all from 20260426000001_init.sql).

-- 1. Status enum -------------------------------------------------------

do $$ begin
  create type public.lead_status as enum ('new', 'contacted', 'booked', 'lost');
exception when duplicate_object then null;
end $$;

-- 2. Table -------------------------------------------------------------

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  full_name text not null,
  contact text,                        -- email or phone, single free-text
  source text,                         -- "Google Ads" / "Facebook" / "Referral" / etc.
  status public.lead_status not null default 'new',
  suburb text,
  notes text,
  captured_at timestamptz not null default now(),
  booked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_leads_client_captured
  on public.leads(client_id, captured_at desc);

create index if not exists idx_leads_status
  on public.leads(status);

drop trigger if exists touch_leads on public.leads;
create trigger touch_leads
  before update on public.leads
  for each row execute function public.touch_updated_at();

-- 3. RLS ---------------------------------------------------------------

alter table public.leads enable row level security;

-- Read: client sees own clinic's leads
drop policy if exists "leads_client_read_own" on public.leads;
create policy "leads_client_read_own" on public.leads
  for select
  using (
    public.get_my_role() = 'client'
    and client_id = public.my_client_id()
  );

-- Read: cgm sees leads for assigned clients
drop policy if exists "leads_cgm_read_assigned" on public.leads;
create policy "leads_cgm_read_assigned" on public.leads
  for select
  using (
    public.get_my_role() = 'cgm'
    and client_id in (
      select client_id from public.client_assignments where cgm_id = auth.uid()
    )
  );

-- Read + write: admin everything
drop policy if exists "leads_admin_all" on public.leads;
create policy "leads_admin_all" on public.leads
  for all
  using (public.is_admin())
  with check (public.is_admin());
