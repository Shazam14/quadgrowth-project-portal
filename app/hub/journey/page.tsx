import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createMilestone } from "./actions";
import "./journey-hub.css";

export const metadata = { title: "Journey Timeline · Hub" };
export const dynamic = "force-dynamic";

type ClientOption = { id: string; name: string };
type MilestoneRow = {
  id: string;
  client_id: string;
  title: string;
  occurred_on: string;
  status: "planned" | "in_progress" | "done";
  updated_at: string;
};

const dateFmt = new Intl.DateTimeFormat("en-AU", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDateOnly(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return dateFmt.format(new Date(Date.UTC(y, m - 1, d)));
}

function todayYmd(): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export default async function HubJourneyPage() {
  const supabase = await createClient();

  const [{ data: clientsData }, { data: rowsData }] = await Promise.all([
    supabase.from("clients").select("id, name").order("name"),
    supabase
      .from("journey_milestones")
      .select("id, client_id, title, occurred_on, status, updated_at")
      .order("occurred_on", { ascending: false }),
  ]);

  const clients = (clientsData ?? []) as ClientOption[];
  const rows = (rowsData ?? []) as MilestoneRow[];
  const clientById = new Map(clients.map((c) => [c.id, c.name]));

  return (
    <main className="jrny-hub" data-testid="journey-hub-page">
      <p className="jrny-hub__eyebrow">/hub · journey timeline</p>
      <header className="jrny-hub__header">
        <h1>Journey Timeline</h1>
        <p>
          Track each clinic&apos;s engagement arc — discovery, audit, launch,
          optimisation cycles. The client sees this as a vertical timeline.
        </p>
      </header>

      <section
        className="jrny-hub__compose"
        data-testid="journey-hub-compose"
        aria-labelledby="compose-heading"
      >
        <h2 id="compose-heading">Add a milestone</h2>
        {clients.length === 0 ? (
          <p className="jrny-hub__hint">
            You don&apos;t have any clients assigned yet. Ask an admin to assign
            you in the Team panel.
          </p>
        ) : (
          <form action={createMilestone} className="jrny-hub__form">
            <div className="jrny-hub__row">
              <label>
                <span>Client</span>
                <select name="client_id" required>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Date</span>
                <input
                  type="date"
                  name="occurred_on"
                  defaultValue={todayYmd()}
                  required
                />
              </label>
              <label>
                <span>Status</span>
                <select name="status" defaultValue="planned">
                  <option value="planned">planned</option>
                  <option value="in_progress">in_progress</option>
                  <option value="done">done</option>
                </select>
              </label>
            </div>

            <label className="jrny-hub__field">
              <span>Title</span>
              <input
                type="text"
                name="title"
                maxLength={200}
                required
                placeholder="e.g. Discovery call"
              />
            </label>

            <label className="jrny-hub__field">
              <span>Description</span>
              <textarea
                name="description"
                rows={3}
                maxLength={1200}
                placeholder="What happened or what's planned. The client sees this verbatim."
              />
            </label>

            <div className="jrny-hub__actions">
              <button
                type="submit"
                className="jrny-hub__btn-primary"
                data-testid="journey-hub-create"
              >
                Add milestone
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="jrny-hub__list-section">
        <h2>All milestones</h2>
        {rows.length === 0 ? (
          <p className="jrny-hub__empty" data-testid="journey-hub-empty">
            No milestones yet. Add the first one above.
          </p>
        ) : (
          <div className="jrny-hub__list" data-testid="journey-hub-list">
            {rows.map((r) => (
              <Link
                key={r.id}
                href={`/hub/journey/${r.id}`}
                className="jrny-hub__list-row"
                data-testid="journey-hub-row"
                data-status={r.status}
              >
                <span className="jrny-hub__list-row-when">
                  {formatDateOnly(r.occurred_on)}
                </span>
                <span className="jrny-hub__list-row-title">{r.title}</span>
                <span className="jrny-hub__list-row-client">
                  {clientById.get(r.client_id) ?? "—"}
                </span>
                <span className={`jrny-hub__pill jrny-hub__pill--${r.status}`}>
                  {r.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
