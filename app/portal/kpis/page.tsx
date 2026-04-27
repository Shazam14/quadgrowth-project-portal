import { createClient } from "@/lib/supabase/server";
import "./kpis.css";

export const metadata = { title: "KPI Overview" };
export const dynamic = "force-dynamic";

type KpiRow = {
  leads_this_month: number;
  leads_last_month: number;
  bookings_this_month: number;
  bookings_last_month: number;
  revenue_this_month: number;
  revenue_last_month: number;
};

const aud = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0,
});

const monthFmt = new Intl.DateTimeFormat("en-AU", { month: "long" });

function trend(current: number, previous: number): {
  dir: "up" | "down" | "flat";
  label: string;
} {
  if (previous === 0 && current === 0) return { dir: "flat", label: "—" };
  if (previous === 0) return { dir: "up", label: "New" };
  const pct = ((current - previous) / previous) * 100;
  if (Math.abs(pct) < 0.5) return { dir: "flat", label: "0%" };
  const sign = pct > 0 ? "+" : "−";
  return {
    dir: pct > 0 ? "up" : "down",
    label: `${sign}${Math.abs(pct).toFixed(0)}%`,
  };
}

function Card({
  title,
  value,
  previous,
  format,
  testid,
}: {
  title: string;
  value: number;
  previous: number;
  format: (n: number) => string;
  testid: string;
}) {
  const t = trend(value, previous);
  const arrow = t.dir === "up" ? "↑" : t.dir === "down" ? "↓" : "→";
  return (
    <article
      className="kpis__card"
      data-testid={testid}
      data-value={value}
      data-previous={previous}
    >
      <p className="kpis__card-title">{title}</p>
      <p className="kpis__card-value">{format(value)}</p>
      <p className={`kpis__trend kpis__trend--${t.dir}`} data-testid={`${testid}-trend`}>
        <span className="kpis__trend-arrow">{arrow}</span>
        <span>{t.label}</span>
        <span className="kpis__trend-prev">vs {format(previous)} last month</span>
      </p>
    </article>
  );
}

export default async function KpisPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_my_kpis");

  const row: KpiRow = (Array.isArray(data) ? data[0] : data) ?? {
    leads_this_month: 0,
    leads_last_month: 0,
    bookings_this_month: 0,
    bookings_last_month: 0,
    revenue_this_month: 0,
    revenue_last_month: 0,
  };

  const thisMonthLabel = monthFmt.format(new Date());

  return (
    <main className="kpis" data-testid="kpis-page">
      <p className="kpis__eyebrow">/portal · kpis</p>
      <header className="kpis__header">
        <h1>KPI Overview</h1>
        <p>
          {thisMonthLabel} so far, with last month for context. Booked patients
          are valued at your clinic&apos;s default lifetime value.
        </p>
      </header>

      {error ? (
        <div className="kpis__error" data-testid="kpis-error">
          Couldn&apos;t load KPIs. {error.message}
        </div>
      ) : (
        <div className="kpis__grid" data-testid="kpis-grid">
          <Card
            title="Leads this month"
            value={Number(row.leads_this_month)}
            previous={Number(row.leads_last_month)}
            format={(n) => String(n)}
            testid="kpi-leads"
          />
          <Card
            title="Bookings this month"
            value={Number(row.bookings_this_month)}
            previous={Number(row.bookings_last_month)}
            format={(n) => String(n)}
            testid="kpi-bookings"
          />
          <Card
            title="Revenue this month"
            value={Number(row.revenue_this_month)}
            previous={Number(row.revenue_last_month)}
            format={(n) => aud.format(n)}
            testid="kpi-revenue"
          />
        </div>
      )}
    </main>
  );
}
