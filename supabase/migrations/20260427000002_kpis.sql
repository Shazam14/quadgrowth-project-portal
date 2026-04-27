-- Phase 1B sub-3 — KPI Overview: clients.default_ltv + get_my_kpis aggregate fn.
-- Depends on: public.clients, public.client_assignments, public.leads,
-- public.get_my_role(), public.my_client_id().

-- 1. Per-clinic default lifetime value ---------------------------------

alter table public.clients
  add column if not exists default_ltv numeric not null default 3000;

-- 2. Aggregate function: this-month + last-month, RLS-equivalent ------

create or replace function public.get_my_kpis()
returns table (
  leads_this_month bigint,
  leads_last_month bigint,
  bookings_this_month bigint,
  bookings_last_month bigint,
  revenue_this_month numeric,
  revenue_last_month numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text := public.get_my_role();
  v_uid uuid := auth.uid();
  v_client_id uuid := public.my_client_id();
  v_this_start timestamptz := date_trunc('month', now());
  v_this_end timestamptz := date_trunc('month', now()) + interval '1 month';
  v_last_start timestamptz := date_trunc('month', now()) - interval '1 month';
  v_last_end timestamptz := date_trunc('month', now());
begin
  return query
  with visible as (
    select l.captured_at, l.booked_at, l.status, c.default_ltv
    from public.leads l
    join public.clients c on c.id = l.client_id
    where
      case
        when v_role = 'admin' then true
        when v_role = 'cgm' then l.client_id in (
          select client_id from public.client_assignments where cgm_id = v_uid
        )
        when v_role = 'client' then l.client_id = v_client_id
        else false
      end
  )
  select
    count(*) filter (
      where captured_at >= v_this_start and captured_at < v_this_end
    )::bigint,
    count(*) filter (
      where captured_at >= v_last_start and captured_at < v_last_end
    )::bigint,
    count(*) filter (
      where status = 'booked'
        and booked_at >= v_this_start and booked_at < v_this_end
    )::bigint,
    count(*) filter (
      where status = 'booked'
        and booked_at >= v_last_start and booked_at < v_last_end
    )::bigint,
    coalesce(sum(default_ltv) filter (
      where status = 'booked'
        and booked_at >= v_this_start and booked_at < v_this_end
    ), 0)::numeric,
    coalesce(sum(default_ltv) filter (
      where status = 'booked'
        and booked_at >= v_last_start and booked_at < v_last_end
    ), 0)::numeric
  from visible;
end;
$$;

grant execute on function public.get_my_kpis() to authenticated;
