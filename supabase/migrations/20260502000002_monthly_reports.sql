-- Phase 1B sub-5 — Monthly Reports: campaign-manager-authored summary cards.
-- Depends on: public.clients, public.profiles, public.client_assignments,
-- public.get_my_role(), public.is_admin(), public.my_client_id(),
-- public.touch_updated_at() (all from 20260426000001_init.sql).

-- 1. Enum --------------------------------------------------------------

do $$ begin
  create type public.report_status as enum ('draft', 'published');
exception when duplicate_object then null;
end $$;

-- 2. Table -------------------------------------------------------------

create table if not exists public.monthly_reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  month date not null,
  wins jsonb not null default '[]'::jsonb,
  challenge text,
  focus text,
  status public.report_status not null default 'draft',
  written_by uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, month),
  constraint monthly_reports_month_first_of_month
    check (extract(day from month) = 1),
  constraint monthly_reports_wins_is_array
    check (jsonb_typeof(wins) = 'array')
);

create index if not exists idx_monthly_reports_client
  on public.monthly_reports(client_id);
create index if not exists idx_monthly_reports_month
  on public.monthly_reports(month desc);

drop trigger if exists touch_monthly_reports on public.monthly_reports;
create trigger touch_monthly_reports
  before update on public.monthly_reports
  for each row execute function public.touch_updated_at();

-- 3. RLS ---------------------------------------------------------------

alter table public.monthly_reports enable row level security;

-- Clients see only their own *published* reports.
drop policy if exists "monthly_reports_client_read_published" on public.monthly_reports;
create policy "monthly_reports_client_read_published" on public.monthly_reports
  for select
  using (
    public.get_my_role() = 'client'
    and client_id = public.my_client_id()
    and status = 'published'
  );

-- CGMs read every report (draft or published) for clients they're assigned to.
drop policy if exists "monthly_reports_cgm_read_assigned" on public.monthly_reports;
create policy "monthly_reports_cgm_read_assigned" on public.monthly_reports
  for select
  using (
    public.get_my_role() = 'cgm'
    and client_id in (
      select client_id from public.client_assignments where cgm_id = auth.uid()
    )
  );

-- CGMs can insert reports for assigned clients.
drop policy if exists "monthly_reports_cgm_insert_assigned" on public.monthly_reports;
create policy "monthly_reports_cgm_insert_assigned" on public.monthly_reports
  for insert
  with check (
    public.get_my_role() = 'cgm'
    and client_id in (
      select client_id from public.client_assignments where cgm_id = auth.uid()
    )
  );

-- CGMs can update reports for assigned clients.
drop policy if exists "monthly_reports_cgm_update_assigned" on public.monthly_reports;
create policy "monthly_reports_cgm_update_assigned" on public.monthly_reports
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

-- CGMs can delete drafts they wrote (don't allow deleting published reports).
drop policy if exists "monthly_reports_cgm_delete_own_draft" on public.monthly_reports;
create policy "monthly_reports_cgm_delete_own_draft" on public.monthly_reports
  for delete
  using (
    public.get_my_role() = 'cgm'
    and status = 'draft'
    and written_by = auth.uid()
  );

drop policy if exists "monthly_reports_admin_all" on public.monthly_reports;
create policy "monthly_reports_admin_all" on public.monthly_reports
  for all
  using (public.is_admin())
  with check (public.is_admin());
