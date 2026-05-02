import { createClient } from "@/lib/supabase/server";
import "./strategy-calls.css";

export const metadata = { title: "Next Strategy Call" };
export const dynamic = "force-dynamic";

type CallRow = {
  id: string;
  scheduled_for: string;
  meeting_url: string | null;
  agenda: string | null;
  recap: string | null;
  status: "scheduled" | "completed" | "cancelled";
};

const dateFmt = new Intl.DateTimeFormat("en-AU", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const timeFmt = new Intl.DateTimeFormat("en-AU", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZoneName: "short",
});

function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

function formatTime(iso: string): string {
  return timeFmt.format(new Date(iso));
}

export default async function StrategyCallsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("strategy_calls")
    .select("id, scheduled_for, meeting_url, agenda, recap, status")
    .order("scheduled_for", { ascending: false });

  const rows = (data ?? []) as CallRow[];
  const nowIso = new Date().toISOString();
  const upcoming = rows
    .filter((r) => r.status === "scheduled" && r.scheduled_for >= nowIso)
    .sort((a, b) => a.scheduled_for.localeCompare(b.scheduled_for));
  const next = upcoming[0] ?? null;
  const past = rows.filter((r) => r.status === "completed");

  return (
    <main className="strat" data-testid="strategy-calls-page">
      <p className="strat__eyebrow">/portal · next strategy call</p>
      <header className="strat__header">
        <h1>Next Strategy Call</h1>
        <p>
          Your monthly check-in with your campaign manager — agenda first, then
          past recaps so nothing slips between sessions.
        </p>
      </header>

      {error ? (
        <div className="strat__error" data-testid="strategy-calls-error">
          Couldn&apos;t load strategy calls. {error.message}
        </div>
      ) : null}

      {next ? (
        <section
          className="strat__next"
          data-testid="strategy-calls-next"
          data-call-id={next.id}
        >
          <p className="strat__next-eyebrow">Upcoming</p>
          <h2 className="strat__next-date">{formatDate(next.scheduled_for)}</h2>
          <p className="strat__next-time">{formatTime(next.scheduled_for)}</p>
          {next.agenda ? (
            <div className="strat__next-agenda">
              <h3>Agenda</h3>
              <p>{next.agenda}</p>
            </div>
          ) : null}
          {next.meeting_url ? (
            <a
              className="strat__next-cta"
              href={next.meeting_url}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="strategy-calls-join"
            >
              Join the call
            </a>
          ) : null}
        </section>
      ) : !error ? (
        <section className="strat__empty" data-testid="strategy-calls-empty">
          No upcoming call scheduled. Your campaign manager will book the next
          one — we&apos;ll show it here as soon as it&apos;s on the calendar.
        </section>
      ) : null}

      {past.length > 0 ? (
        <section className="strat__past" data-testid="strategy-calls-past">
          <h2>Past calls</h2>
          <div className="strat__past-list">
            {past.map((c) => (
              <article
                key={c.id}
                className="strat__past-card"
                data-testid="strategy-calls-past-card"
                data-call-id={c.id}
              >
                <header>
                  <h3>{formatDate(c.scheduled_for)}</h3>
                </header>
                {c.agenda ? (
                  <div className="strat__past-block">
                    <h4>Agenda</h4>
                    <p>{c.agenda}</p>
                  </div>
                ) : null}
                {c.recap ? (
                  <div className="strat__past-block strat__past-block--recap">
                    <h4>Recap</h4>
                    <p>{c.recap}</p>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
