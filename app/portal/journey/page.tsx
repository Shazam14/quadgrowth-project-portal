import { createClient } from "@/lib/supabase/server";
import "./journey.css";

export const metadata = { title: "Journey Timeline" };
export const dynamic = "force-dynamic";

type Status = "planned" | "in_progress" | "done";

type MilestoneRow = {
  id: string;
  title: string;
  description: string | null;
  occurred_on: string; // YYYY-MM-DD
  status: Status;
};

const dateFmt = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatDate(iso: string): string {
  // Treat YYYY-MM-DD as a calendar date in Sydney without timezone drift.
  const [y, m, d] = iso.split("-").map(Number);
  return dateFmt.format(new Date(Date.UTC(y, m - 1, d)));
}

const STATUS_LABEL: Record<Status, string> = {
  planned: "Planned",
  in_progress: "In progress",
  done: "Done",
};

export default async function JourneyPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("journey_milestones")
    .select("id, title, description, occurred_on, status")
    .order("occurred_on", { ascending: true });

  const rows = (data ?? []) as MilestoneRow[];

  return (
    <main className="jrny" data-testid="journey-page">
      <p className="jrny__eyebrow">/portal · journey timeline</p>
      <header className="jrny__header">
        <h1>Your Journey</h1>
        <p>
          Every milestone in our work together — what&apos;s shipped, what&apos;s
          running now, and what&apos;s next.
        </p>
      </header>

      {error ? (
        <div className="jrny__error" data-testid="journey-error">
          Couldn&apos;t load journey timeline. {error.message}
        </div>
      ) : null}

      {!error && rows.length === 0 ? (
        <section className="jrny__empty" data-testid="journey-empty">
          No milestones yet. Your campaign manager will add the first one once
          your account is live.
        </section>
      ) : null}

      {rows.length > 0 ? (
        <ol className="jrny__timeline" data-testid="journey-timeline">
          {rows.map((m) => (
            <li
              key={m.id}
              className={`jrny__item jrny__item--${m.status}`}
              data-testid="journey-milestone"
              data-milestone-id={m.id}
              data-status={m.status}
            >
              <div className="jrny__pip" aria-hidden="true" />
              <div className="jrny__card">
                <div className="jrny__card-row">
                  <p className="jrny__date">{formatDate(m.occurred_on)}</p>
                  <span
                    className={`jrny__pill jrny__pill--${m.status}`}
                    data-testid="journey-pill"
                  >
                    {STATUS_LABEL[m.status]}
                  </span>
                </div>
                <h2 className="jrny__title">{m.title}</h2>
                {m.description ? (
                  <p className="jrny__desc">{m.description}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      ) : null}
    </main>
  );
}
