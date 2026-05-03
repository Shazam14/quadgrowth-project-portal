-- Phase 1B sub-7 — Journey Timeline: ordered list of engagement milestones per client.
-- Depends on: public.clients, public.profiles, public.client_assignments,
-- public.get_my_role(), public.is_admin(), public.my_client_id(),
-- public.touch_updated_at() (all from 20260426000001_init.sql).

-- 1. Enum --------------------------------------------------------------

do $$ begin
  create type public.journey_status as enum ('planned', 'in_progress', 'done');
exception when duplicate_object then null;
end $$;

-- 2. Table -------------------------------------------------------------

create table if not exists public.journey_milestones (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  title text not null,
  description text,
  occurred_on date not null,
  status public.journey_status not null default 'planned',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_journey_milestones_client
  on public.journey_milestones(client_id);
create index if not exists idx_journey_milestones_client_occurred
  on public.journey_milestones(client_id, occurred_on);

drop trigger if exists touch_journey_milestones on public.journey_milestones;
create trigger touch_journey_milestones
  before update on public.journey_milestones
  for each row execute function public.touch_updated_at();

-- 3. RLS ---------------------------------------------------------------

alter table public.journey_milestones enable row level security;

-- Clients see every milestone for their own clinic (any status — full arc).
drop policy if exists "journey_milestones_client_read_own" on public.journey_milestones;
create policy "journey_milestones_client_read_own" on public.journey_milestones
  for select
  using (
    public.get_my_role() = 'client'
    and client_id = public.my_client_id()
  );

-- CGMs read every milestone for clients they're assigned to.
drop policy if exists "journey_milestones_cgm_read_assigned" on public.journey_milestones;
create policy "journey_milestones_cgm_read_assigned" on public.journey_milestones
  for select
  using (
    public.get_my_role() = 'cgm'
    and client_id in (
      select client_id from public.client_assignments where cgm_id = auth.uid()
    )
  );

-- CGMs can insert milestones for assigned clients.
drop policy if exists "journey_milestones_cgm_insert_assigned" on public.journey_milestones;
create policy "journey_milestones_cgm_insert_assigned" on public.journey_milestones
  for insert
  with check (
    public.get_my_role() = 'cgm'
    and client_id in (
      select client_id from public.client_assignments where cgm_id = auth.uid()
    )
  );

-- CGMs can update milestones for assigned clients.
drop policy if exists "journey_milestones_cgm_update_assigned" on public.journey_milestones;
create policy "journey_milestones_cgm_update_assigned" on public.journey_milestones
  for update
  using (
    public.get_my_role() = 'cgm'
    and client_id in (
      select client_id from public.client_assignments where cgm_id = auth.uid()
    )
  )
  with check (
    public.get_my_role() = 'cgm'
    and client_id in (
      select client_id from public.client_assignments where cgm_id = auth.uid()
    )
  );

-- CGMs can delete a milestone they created (any status — milestones are
-- cheap to recreate, no recap-equivalent history to preserve).
drop policy if exists "journey_milestones_cgm_delete_own" on public.journey_milestones;
create policy "journey_milestones_cgm_delete_own" on public.journey_milestones
  for delete
  using (
    public.get_my_role() = 'cgm'
    and created_by = auth.uid()
  );

drop policy if exists "journey_milestones_admin_all" on public.journey_milestones;
create policy "journey_milestones_admin_all" on public.journey_milestones
  for all
  using (public.is_admin())
  with check (public.is_admin());
