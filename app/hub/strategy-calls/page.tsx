import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createCall } from "./actions";
import { nextWeekSydneyDatetimeLocal } from "./time";
import "./strategy-calls-hub.css";

export const metadata = { title: "Strategy Calls · Hub" };
export const dynamic = "force-dynamic";

type ClientOption = { id: string; name: string };
type CallRow = {
  id: string;
  client_id: string;
  scheduled_for: string;
  status: "scheduled" | "completed" | "cancelled";
  updated_at: string;
};

const dateFmt = new Intl.DateTimeFormat("en-AU", {
  timeZone: "Australia/Sydney",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const dateTimeFmt = new Intl.DateTimeFormat("en-AU", {
  timeZone: "Australia/Sydney",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

export default async function HubStrategyCallsPage() {
  const supabase = await createClient();

  const [{ data: clientsData }, { data: callsData }] = await Promise.all([
    supabase.from("clients").select("id, name").order("name"),
    supabase
      .from("strategy_calls")
      .select("id, client_id, scheduled_for, status, updated_at")
      .order("scheduled_for", { ascending: false }),
  ]);

  const clients = (clientsData ?? []) as ClientOption[];
  const calls = (callsData ?? []) as CallRow[];
  const clientById = new Map(clients.map((c) => [c.id, c.name]));

  return (
    <main className="strat-hub" data-testid="strategy-calls-hub-page">
      <p className="strat-hub__eyebrow">/hub · strategy calls</p>
      <header className="strat-hub__header">
        <h1>Strategy Calls</h1>
        <p>
          Schedule the next monthly check-in for each clinic. After the call,
          mark it complete and write a short recap so the client can revisit it.
        </p>
      </header>

      <section
        className="strat-hub__compose"
        data-testid="strategy-calls-hub-compose"
        aria-labelledby="compose-heading"
      >
        <h2 id="compose-heading">Schedule a call</h2>
        {clients.length === 0 ? (
          <p className="strat-hub__hint">
            You don&apos;t have any clients assigned yet. Ask an admin to assign
            you in the Team panel.
          </p>
        ) : (
          <form action={createCall} className="strat-hub__form">
            <div className="strat-hub__row">
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
                <span>When (Sydney time)</span>
                <input
                  type="datetime-local"
                  name="scheduled_for"
                  defaultValue={nextWeekSydneyDatetimeLocal()}
                  required
                />
              </label>
            </div>

            <label className="strat-hub__field">
              <span>Meeting URL</span>
              <input
                type="url"
                name="meeting_url"
                maxLength={500}
                placeholder="https://meet.google.com/..."
              />
            </label>

            <label className="strat-hub__field">
              <span>Agenda</span>
              <textarea
                name="agenda"
                rows={3}
                maxLength={1200}
                placeholder="What you'll cover. Keep it tight."
              />
            </label>

            <div className="strat-hub__actions">
              <button
                type="submit"
                className="strat-hub__btn-primary"
                data-testid="strategy-calls-hub-create"
              >
                Schedule
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="strat-hub__list-section">
        <h2>All calls</h2>
        {calls.length === 0 ? (
          <p
            className="strat-hub__empty"
            data-testid="strategy-calls-hub-empty"
          >
            No calls yet. Schedule the first one above.
          </p>
        ) : (
          <div
            className="strat-hub__list"
            data-testid="strategy-calls-hub-list"
          >
            {calls.map((c) => (
              <Link
                key={c.id}
                href={`/hub/strategy-calls/${c.id}`}
                className="strat-hub__list-row"
                data-testid="strategy-calls-hub-row"
                data-status={c.status}
              >
                <span className="strat-hub__list-row-when">
                  {dateTimeFmt.format(new Date(c.scheduled_for))}
                </span>
                <span className="strat-hub__list-row-client">
                  {clientById.get(c.client_id) ?? "—"}
                </span>
                <span className={`strat-hub__pill strat-hub__pill--${c.status}`}>
                  {c.status}
                </span>
                <span className="strat-hub__list-row-updated">
                  {dateFmt.format(new Date(c.updated_at))}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
