import { createClient } from "@/lib/supabase/server";
import "./reports.css";

export const metadata = { title: "Monthly Reports" };
export const dynamic = "force-dynamic";

type ReportRow = {
  id: string;
  month: string;
  wins: unknown;
  challenge: string | null;
  focus: string | null;
  published_at: string | null;
};

const monthFmt = new Intl.DateTimeFormat("en-AU", {
  month: "long",
  year: "numeric",
});

function formatMonth(iso: string): string {
  // month is YYYY-MM-01; parse as UTC to avoid timezone slipping back a day.
  const [y, m] = iso.split("-").map(Number);
  return monthFmt.format(new Date(Date.UTC(y, m - 1, 1)));
}

function asWins(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
}

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("monthly_reports")
    .select("id, month, wins, challenge, focus, published_at")
    .order("month", { ascending: false });

  const rows = (data ?? []) as ReportRow[];

  return (
    <main className="reports" data-testid="reports-page">
      <p className="reports__eyebrow">/portal · monthly reports</p>
      <header className="reports__header">
        <h1>Monthly Reports</h1>
        <p>
          A short, honest read on every month — three wins, one challenge, and
          what your campaign manager is focused on next.
        </p>
      </header>

      {error ? (
        <div className="reports__error" data-testid="reports-error">
          Couldn&apos;t load reports. {error.message}
        </div>
      ) : rows.length === 0 ? (
        <div className="reports__empty" data-testid="reports-empty">
          No reports published yet. Your campaign manager publishes a fresh
          summary at the end of each month.
        </div>
      ) : (
        <div className="reports__list" data-testid="reports-list">
          {rows.map((r) => {
            const wins = asWins(r.wins);
            return (
              <article
                key={r.id}
                className="reports__card"
                data-testid="reports-card"
                data-month={r.month}
              >
                <header className="reports__card-head">
                  <h2>{formatMonth(r.month)}</h2>
                </header>

                <section className="reports__section reports__section--wins">
                  <h3>Wins</h3>
                  {wins.length === 0 ? (
                    <p className="reports__empty-line">No wins recorded.</p>
                  ) : (
                    <ul>
                      {wins.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  )}
                </section>

                {r.challenge ? (
                  <section className="reports__section reports__section--challenge">
                    <h3>Challenge</h3>
                    <p>{r.challenge}</p>
                  </section>
                ) : null}

                {r.focus ? (
                  <section className="reports__section reports__section--focus">
                    <h3>Next month focus</h3>
                    <p>{r.focus}</p>
                  </section>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
