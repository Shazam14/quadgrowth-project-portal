import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateMilestone, deleteMilestone } from "../actions";
import "../journey-hub.css";

export const metadata = { title: "Edit Milestone · Hub" };
export const dynamic = "force-dynamic";

type Status = "planned" | "in_progress" | "done";
type MilestoneFull = {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  occurred_on: string;
  status: Status;
};
type ClientRow = { id: string; name: string };

const dateFmt = new Intl.DateTimeFormat("en-AU", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDateOnly(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return dateFmt.format(new Date(Date.UTC(y, m - 1, d)));
}

export default async function EditJourneyMilestonePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: rowData }, { data: clientsData }] = await Promise.all([
    supabase
      .from("journey_milestones")
      .select("id, client_id, title, description, occurred_on, status")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("clients").select("id, name").order("name"),
  ]);

  if (!rowData) notFound();

  const milestone = rowData as MilestoneFull;
  const clients = (clientsData ?? []) as ClientRow[];
  const clientName =
    clients.find((c) => c.id === milestone.client_id)?.name ?? "—";

  const updateAction = updateMilestone.bind(null, milestone.id);
  const deleteAction = deleteMilestone.bind(null, milestone.id);

  return (
    <main className="jrny-hub" data-testid="journey-hub-edit">
      <p className="jrny-hub__eyebrow">
        <Link href="/hub/journey">/hub · journey timeline</Link>
      </p>
      <header className="jrny-hub__header">
        <h1>Edit Milestone</h1>
        <p>
          {clientName} · {formatDateOnly(milestone.occurred_on)} ·{" "}
          <span
            className={`jrny-hub__pill jrny-hub__pill--${milestone.status}`}
          >
            {milestone.status}
          </span>
        </p>
      </header>

      <form action={updateAction} className="jrny-hub__form">
        <div className="jrny-hub__row">
          <label>
            <span>Client</span>
            <input value={clientName} disabled readOnly />
          </label>
          <label>
            <span>Date</span>
            <input
              type="date"
              name="occurred_on"
              defaultValue={milestone.occurred_on}
              required
            />
          </label>
          <label>
            <span>Status</span>
            <select name="status" defaultValue={milestone.status}>
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
            defaultValue={milestone.title}
            required
          />
        </label>

        <label className="jrny-hub__field">
          <span>Description</span>
          <textarea
            name="description"
            rows={3}
            maxLength={1200}
            defaultValue={milestone.description ?? ""}
          />
        </label>

        <div className="jrny-hub__actions">
          <button
            type="submit"
            className="jrny-hub__btn-primary"
            data-testid="journey-hub-save"
          >
            Save changes
          </button>
        </div>
      </form>

      <form action={deleteAction} className="jrny-hub__danger">
        <button
          type="submit"
          className="jrny-hub__btn-danger"
          data-testid="journey-hub-delete"
        >
          Delete milestone
        </button>
      </form>
    </main>
  );
}
