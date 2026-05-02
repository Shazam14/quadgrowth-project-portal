-- Phase 1B sub-6 — Next Strategy Call: scheduled + past strategy calls per client.
-- Depends on: public.clients, public.profiles, public.client_assignments,
-- public.get_my_role(), public.is_admin(), public.my_client_id(),
-- public.touch_updated_at() (all from 20260426000001_init.sql).

-- 1. Enum --------------------------------------------------------------

do $$ begin
  create type public.strategy_call_status as enum ('scheduled', 'completed', 'cancelled');
exception when duplicate_object then null;
end $$;

-- 2. Table -------------------------------------------------------------

create table if not exists public.strategy_calls (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  scheduled_for timestamptz not null,
  meeting_url text,
  agenda text,
  recap text,
  status public.strategy_call_status not null default 'scheduled',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_strategy_calls_client
  on public.strategy_calls(client_id);
create index if not exists idx_strategy_calls_scheduled_for
  on public.strategy_calls(scheduled_for desc);

drop trigger if exists touch_strategy_calls on public.strategy_calls;
create trigger touch_strategy_calls
  before update on public.strategy_calls
  for each row execute function public.touch_updated_at();

-- 3. RLS ---------------------------------------------------------------

alter table public.strategy_calls enable row level security;

-- Clients see every call for their own clinic (any status — scheduled or completed).
drop policy if exists "strategy_calls_client_read_own" on public.strategy_calls;
create policy "strategy_calls_client_read_own" on public.strategy_calls
  for select
  using (
    public.get_my_role() = 'client'
    and client_id = public.my_client_id()
  );

-- CGMs read every call for clients they're assigned to.
drop policy if exists "strategy_calls_cgm_read_assigned" on public.strategy_calls;
create policy "strategy_calls_cgm_read_assigned" on public.strategy_calls
  for select
  using (
    public.get_my_role() = 'cgm'
    and client_id in (
      select client_id from public.client_assignments where cgm_id = auth.uid()
    )
  );

-- CGMs can insert calls for assigned clients.
drop policy if exists "strategy_calls_cgm_insert_assigned" on public.strategy_calls;
create policy "strategy_calls_cgm_insert_assigned" on public.strategy_calls
  for insert
  with check (
    public.get_my_role() = 'cgm'
    and client_id in (
      select client_id from public.client_assignments where cgm_id = auth.uid()
    )
  );

-- CGMs can update calls for assigned clients.
drop policy if exists "strategy_calls_cgm_update_assigned" on public.strategy_calls;
create policy "strategy_calls_cgm_update_assigned" on public.strategy_calls
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

-- CGMs can delete a call they created, but only if it isn't completed
-- (preserve recap history once the call is logged as done).
drop policy if exists "strategy_calls_cgm_delete_own_unfinished" on public.strategy_calls;
create policy "strategy_calls_cgm_delete_own_unfinished" on public.strategy_calls
  for delete
  using (
    public.get_my_role() = 'cgm'
    and status <> 'completed'
    and created_by = auth.uid()
  );

drop policy if exists "strategy_calls_admin_all" on public.strategy_calls;
create policy "strategy_calls_admin_all" on public.strategy_calls
  for all
  using (public.is_admin())
  with check (public.is_admin());
