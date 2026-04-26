import { createClient } from "@/lib/supabase/server";
import "./leads.css";

export const metadata = { title: "Live Lead Feed" };
export const dynamic = "force-dynamic";

type Status = "new" | "contacted" | "booked" | "lost";

type LeadRow = {
  id: string;
  full_name: string;
  contact: string | null;
  source: string | null;
  suburb: string | null;
  status: Status;
  notes: string | null;
  captured_at: string;
  booked_at: string | null;
};

const STATUS_LABEL: Record<Status, string> = {
  new: "New",
  contacted: "Contacted",
  booked: "Booked",
  lost: "Lost",
};

const dateFmt = new Intl.DateTimeFormat("en-AU", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return dateFmt.format(new Date(iso));
}

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(
      "id, full_name, contact, source, suburb, status, notes, captured_at, booked_at",
    )
    .order("captured_at", { ascending: false });

  const rows = (data ?? []) as LeadRow[];

  return (
    <main className="leads" data-testid="leads-page">
      <p className="leads__eyebrow">/portal · live lead feed</p>
      <header className="leads__header">
        <h1>Live Lead Feed</h1>
        <p>
          Every patient enquiry from your campaigns, in the order they came in.
          Updates as they land — refresh to pull the latest.
        </p>
      </header>

      <div
        className="leads__count"
        data-testid="leads-count"
        data-count={rows.length}
      >
        {rows.length} lead{rows.length === 1 ? "" : "s"}
      </div>

      {error ? (
        <div className="leads__error" data-testid="leads-error">
          Couldn&apos;t load leads. {error.message}
        </div>
      ) : rows.length === 0 ? (
        <div className="leads__empty" data-testid="leads-empty">
          No leads yet. New patient enquiries will appear here as they land.
        </div>
      ) : (
        <div className="leads__table-wrap">
          <table className="leads__table" data-testid="leads-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Source</th>
                <th>Suburb</th>
                <th>Status</th>
                <th>Captured</th>
                <th>Booked</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} data-testid="leads-row" data-status={r.status}>
                  <td>{r.full_name}</td>
                  <td>{r.contact ?? "—"}</td>
                  <td>{r.source ?? "—"}</td>
                  <td>{r.suburb ?? "—"}</td>
                  <td>
                    <span
                      className={`leads__pill leads__pill--${r.status}`}
                      data-testid="leads-status"
                    >
                      {STATUS_LABEL[r.status]}
                    </span>
                  </td>
                  <td>{formatDate(r.captured_at)}</td>
                  <td>{formatDate(r.booked_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
