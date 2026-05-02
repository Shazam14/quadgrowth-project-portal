import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createReport } from "./actions";
import "./reports-hub.css";

export const metadata = { title: "Monthly Reports · Hub" };
export const dynamic = "force-dynamic";

type ClientOption = { id: string; name: string };
type ReportRow = {
  id: string;
  client_id: string;
  month: string;
  status: "draft" | "published";
  updated_at: string;
};

const monthFmt = new Intl.DateTimeFormat("en-AU", {
  month: "long",
  year: "numeric",
});
const dateFmt = new Intl.DateTimeFormat("en-AU", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatMonth(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  return monthFmt.format(new Date(Date.UTC(y, m - 1, 1)));
}

function thisMonthYYYYMM(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default async function HubReportsPage() {
  const supabase = await createClient();

  const [{ data: clientsData }, { data: reportsData }] = await Promise.all([
    supabase.from("clients").select("id, name").order("name"),
    supabase
      .from("monthly_reports")
      .select("id, client_id, month, status, updated_at")
      .order("month", { ascending: false }),
  ]);

  const clients = (clientsData ?? []) as ClientOption[];
  const reports = (reportsData ?? []) as ReportRow[];
  const clientById = new Map(clients.map((c) => [c.id, c.name]));

  return (
    <main className="reports-hub" data-testid="reports-hub-page">
      <p className="reports-hub__eyebrow">/hub · monthly reports</p>
      <header className="reports-hub__header">
        <h1>Monthly Reports</h1>
        <p>
          Write the monthly summary for each assigned clinic. Save as draft,
          then publish when ready — clients only see published reports.
        </p>
      </header>

      <section
        className="reports-hub__compose"
        data-testid="reports-hub-compose"
        aria-labelledby="compose-heading"
      >
        <h2 id="compose-heading">Compose new report</h2>
        {clients.length === 0 ? (
          <p className="reports-hub__hint">
            You don&apos;t have any clients assigned yet. Ask an admin to assign
            you in the Team panel.
          </p>
        ) : (
          <form action={createReport} className="reports-hub__form">
            <div className="reports-hub__row">
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
                <span>Month</span>
                <input
                  type="month"
                  name="month"
                  defaultValue={thisMonthYYYYMM()}
                  required
                />
              </label>
            </div>

            <fieldset className="reports-hub__fieldset">
              <legend>Three wins</legend>
              <input name="win_1" required maxLength={600} placeholder="Win 1" />
              <input name="win_2" maxLength={600} placeholder="Win 2" />
              <input name="win_3" maxLength={600} placeholder="Win 3" />
            </fieldset>

            <label className="reports-hub__textarea">
              <span>Challenge</span>
              <textarea
                name="challenge"
                rows={3}
                maxLength={600}
                placeholder="One honest challenge from the month."
              />
            </label>

            <label className="reports-hub__textarea">
              <span>Next month focus</span>
              <textarea
                name="focus"
                rows={3}
                maxLength={600}
                placeholder="What you're attacking next month."
              />
            </label>

            <div className="reports-hub__actions">
              <button type="submit" name="intent" value="draft">
                Save as draft
              </button>
              <button
                type="submit"
                name="intent"
                value="publish"
                className="reports-hub__btn-primary"
              >
                Publish
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="reports-hub__list-section">
        <h2>All reports</h2>
        {reports.length === 0 ? (
          <p className="reports-hub__empty" data-testid="reports-hub-empty">
            No reports yet. Compose your first one above.
          </p>
        ) : (
          <div className="reports-hub__list" data-testid="reports-hub-list">
            {reports.map((r) => (
              <Link
                key={r.id}
                href={`/hub/reports/${r.id}`}
                className="reports-hub__row"
                data-testid="reports-hub-row"
                data-status={r.status}
              >
                <span className="reports-hub__row-month">
                  {formatMonth(r.month)}
                </span>
                <span className="reports-hub__row-client">
                  {clientById.get(r.client_id) ?? "—"}
                </span>
                <span
                  className={`reports-hub__pill reports-hub__pill--${r.status}`}
                >
                  {r.status}
                </span>
                <span className="reports-hub__row-updated">
                  {dateFmt.format(new Date(r.updated_at))}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
