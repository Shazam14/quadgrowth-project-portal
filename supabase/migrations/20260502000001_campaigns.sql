-- Phase 1B sub-4 — Campaign Status: campaigns table + RLS.
-- Depends on: public.clients, public.client_assignments,
-- public.get_my_role(), public.is_admin(), public.my_client_id(),
-- public.touch_updated_at() (all from 20260426000001_init.sql).

-- 1. Enums -------------------------------------------------------------

do $$ begin
  create type public.campaign_channel as enum ('google_ads', 'meta_ads', 'gbp', 'landing_page');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.campaign_status as enum ('live', 'paused', 'setup');
exception when duplicate_object then null;
end $$;

-- 2. Table -------------------------------------------------------------

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  channel public.campaign_channel not null,
  status public.campaign_status not null default 'setup',
  notes text,
  started_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, channel)
);

create index if not exists idx_campaigns_client
  on public.campaigns(client_id);

drop trigger if exists touch_campaigns on public.campaigns;
create trigger touch_campaigns
  before update on public.campaigns
  for each row execute function public.touch_updated_at();

-- 3. RLS ---------------------------------------------------------------

alter table public.campaigns enable row level security;

drop policy if exists "campaigns_client_read_own" on public.campaigns;
create policy "campaigns_client_read_own" on public.campaigns
  for select
  using (
    public.get_my_role() = 'client'
    and client_id = public.my_client_id()
  );

drop policy if exists "campaigns_cgm_read_assigned" on public.campaigns;
create policy "campaigns_cgm_read_assigned" on public.campaigns
  for select
  using (
    public.get_my_role() = 'cgm'
    and client_id in (
      select client_id from public.client_assignments where cgm_id = auth.uid()
    )
  );

drop policy if exists "campaigns_admin_all" on public.campaigns;
create policy "campaigns_admin_all" on public.campaigns
  for all
  using (public.is_admin())
  with check (public.is_admin());
