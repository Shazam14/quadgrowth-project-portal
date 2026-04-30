-- Zadarma call log: calls table + RLS.
-- Depends on: public.get_my_role(), public.is_admin()
-- (both from 20260426000001_init.sql).
-- client_id intentionally omitted — calls are CGM-owned, not client-scoped in v1.

-- 1. Table -------------------------------------------------------------

create table if not exists public.calls (
  id               uuid        primary key default gen_random_uuid(),
  cgm_id           uuid        not null references auth.users(id) on delete cascade,
  prospect_phone   text        not null,
  zadarma_call_id  text        unique,          -- Zadarma's own ID; used for dedup on webhook retry
  started_at       timestamptz,
  ended_at         timestamptz,
  duration_s       integer,                     -- call duration in seconds from Zadarma payload
  recording_url    text,                        -- absolute URL served by Zadarma; stored as-is
  created_at       timestamptz not null default now()
);

create index if not exists idx_calls_cgm_started
  on public.calls(cgm_id, started_at desc);

-- 2. RLS ---------------------------------------------------------------

alter table public.calls enable row level security;

-- Read: cgm sees own calls only
drop policy if exists "calls_cgm_read_own" on public.calls;
create policy "calls_cgm_read_own" on public.calls
  for select
  using (
    public.get_my_role() = 'cgm'
    and cgm_id = auth.uid()
  );

-- Read + write: admin everything
drop policy if exists "calls_admin_all" on public.calls;
create policy "calls_admin_all" on public.calls
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Insert: webhook route uses service-role (bypasses RLS) — no insert policy needed for cgm/client.
