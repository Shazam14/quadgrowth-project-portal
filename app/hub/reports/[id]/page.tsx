import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateReport, deleteDraft } from "../actions";
import "../reports-hub.css";

export const metadata = { title: "Edit Report · Hub" };
export const dynamic = "force-dynamic";

type ReportFull = {
  id: string;
  client_id: string;
  month: string;
  wins: unknown;
  challenge: string | null;
  focus: string | null;
  status: "draft" | "published";
  published_at: string | null;
  updated_at: string;
};

type ClientRow = { id: string; name: string };

function asWins(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .slice(0, 3);
}

function monthToInputValue(iso: string): string {
  return iso.slice(0, 7); // YYYY-MM-01 → YYYY-MM
}

const monthFmt = new Intl.DateTimeFormat("en-AU", {
  month: "long",
  year: "numeric",
});

function formatMonth(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  return monthFmt.format(new Date(Date.UTC(y, m - 1, 1)));
}

export default async function EditReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: reportData }, { data: clientsData }] = await Promise.all([
    supabase
      .from("monthly_reports")
      .select("id, client_id, month, wins, challenge, focus, status, published_at, updated_at")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("clients").select("id, name").order("name"),
  ]);

  if (!reportData) notFound();

  const report = reportData as ReportFull;
  const clients = (clientsData ?? []) as ClientRow[];
  const wins = asWins(report.wins);
  const clientName =
    clients.find((c) => c.id === report.client_id)?.name ?? "—";

  const updateAction = updateReport.bind(null, report.id);
  const deleteAction = deleteDraft.bind(null, report.id);

  return (
    <main className="reports-hub" data-testid="reports-hub-edit">
      <p className="reports-hub__eyebrow">
        <Link href="/hub/reports">/hub · monthly reports</Link>
      </p>
      <header className="reports-hub__header">
        <h1>Edit Report</h1>
        <p>
          {clientName} · {formatMonth(report.month)} ·{" "}
          <span
            className={`reports-hub__pill reports-hub__pill--${report.status}`}
          >
            {report.status}
          </span>
        </p>
      </header>

      <form action={updateAction} className="reports-hub__form">
        <div className="reports-hub__row">
          <label>
            <span>Client</span>
            <input value={clientName} disabled readOnly />
          </label>
          <label>
            <span>Month</span>
            <input
              type="month"
              name="month"
              defaultValue={monthToInputValue(report.month)}
              required
            />
          </label>
        </div>

        <fieldset className="reports-hub__fieldset">
          <legend>Three wins</legend>
          <input
            name="win_1"
            required
            maxLength={600}
            defaultValue={wins[0] ?? ""}
            placeholder="Win 1"
          />
          <input
            name="win_2"
            maxLength={600}
            defaultValue={wins[1] ?? ""}
            placeholder="Win 2"
          />
          <input
            name="win_3"
            maxLength={600}
            defaultValue={wins[2] ?? ""}
            placeholder="Win 3"
          />
        </fieldset>

        <label className="reports-hub__textarea">
          <span>Challenge</span>
          <textarea
            name="challenge"
            rows={3}
            maxLength={600}
            defaultValue={report.challenge ?? ""}
          />
        </label>

        <label className="reports-hub__textarea">
          <span>Next month focus</span>
          <textarea
            name="focus"
            rows={3}
            maxLength={600}
            defaultValue={report.focus ?? ""}
          />
        </label>

        <div className="reports-hub__actions">
          <button type="submit" name="intent" value="save">
            Save changes
          </button>
          {report.status === "draft" ? (
            <button
              type="submit"
              name="intent"
              value="publish"
              className="reports-hub__btn-primary"
            >
              Publish
            </button>
          ) : (
            <button type="submit" name="intent" value="unpublish">
              Unpublish (back to draft)
            </button>
          )}
        </div>
      </form>

      {report.status === "draft" ? (
        <form action={deleteAction} className="reports-hub__danger">
          <button
            type="submit"
            className="reports-hub__btn-danger"
            data-testid="reports-hub-delete"
          >
            Delete draft
          </button>
        </form>
      ) : null}
    </main>
  );
}
