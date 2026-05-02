import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateCall, deleteCall } from "../actions";
import { isoToSydneyDatetimeLocal } from "../time";
import "../strategy-calls-hub.css";

export const metadata = { title: "Edit Strategy Call · Hub" };
export const dynamic = "force-dynamic";

type CallFull = {
  id: string;
  client_id: string;
  scheduled_for: string;
  meeting_url: string | null;
  agenda: string | null;
  recap: string | null;
  status: "scheduled" | "completed" | "cancelled";
};

type ClientRow = { id: string; name: string };

const dateTimeFmt = new Intl.DateTimeFormat("en-AU", {
  timeZone: "Australia/Sydney",
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

export default async function EditStrategyCallPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: callData }, { data: clientsData }] = await Promise.all([
    supabase
      .from("strategy_calls")
      .select(
        "id, client_id, scheduled_for, meeting_url, agenda, recap, status",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("clients").select("id, name").order("name"),
  ]);

  if (!callData) notFound();

  const call = callData as CallFull;
  const clients = (clientsData ?? []) as ClientRow[];
  const clientName =
    clients.find((c) => c.id === call.client_id)?.name ?? "—";

  const updateAction = updateCall.bind(null, call.id);
  const deleteAction = deleteCall.bind(null, call.id);

  return (
    <main className="strat-hub" data-testid="strategy-calls-hub-edit">
      <p className="strat-hub__eyebrow">
        <Link href="/hub/strategy-calls">/hub · strategy calls</Link>
      </p>
      <header className="strat-hub__header">
        <h1>Edit Strategy Call</h1>
        <p>
          {clientName} · {dateTimeFmt.format(new Date(call.scheduled_for))} ·{" "}
          <span className={`strat-hub__pill strat-hub__pill--${call.status}`}>
            {call.status}
          </span>
        </p>
      </header>

      <form action={updateAction} className="strat-hub__form">
        <div className="strat-hub__row">
          <label>
            <span>Client</span>
            <input value={clientName} disabled readOnly />
          </label>
          <label>
            <span>When (Sydney time)</span>
            <input
              type="datetime-local"
              name="scheduled_for"
              defaultValue={isoToSydneyDatetimeLocal(call.scheduled_for)}
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
            defaultValue={call.meeting_url ?? ""}
            placeholder="https://meet.google.com/..."
          />
        </label>

        <label className="strat-hub__field">
          <span>Status</span>
          <select name="status" defaultValue={call.status}>
            <option value="scheduled">scheduled</option>
            <option value="completed">completed</option>
            <option value="cancelled">cancelled</option>
          </select>
        </label>

        <label className="strat-hub__field">
          <span>Agenda</span>
          <textarea
            name="agenda"
            rows={3}
            maxLength={1200}
            defaultValue={call.agenda ?? ""}
          />
        </label>

        <label className="strat-hub__field">
          <span>Recap (visible to client once status is completed)</span>
          <textarea
            name="recap"
            rows={5}
            maxLength={1200}
            defaultValue={call.recap ?? ""}
            placeholder="What you covered and what was decided. The client sees this on their portal."
          />
        </label>

        <div className="strat-hub__actions">
          <button
            type="submit"
            className="strat-hub__btn-primary"
            data-testid="strategy-calls-hub-save"
          >
            Save changes
          </button>
        </div>
      </form>

      {call.status !== "completed" ? (
        <form action={deleteAction} className="strat-hub__danger">
          <button
            type="submit"
            className="strat-hub__btn-danger"
            data-testid="strategy-calls-hub-delete"
          >
            Delete call
          </button>
        </form>
      ) : null}
    </main>
  );
}
