import { createClient } from "@/lib/supabase/server";
import "./calls.css";

export const metadata = { title: "Call History" };
export const dynamic = "force-dynamic";

type CallRow = {
  id: string;
  prospect_phone: string;
  started_at: string | null;
  ended_at: string | null;
  duration_s: number | null;
  recording_url: string | null;
  zadarma_call_id: string | null;
};

const dateFmt = new Intl.DateTimeFormat("en-AU", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: "Australia/Brisbane",
});

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return dateFmt.format(new Date(iso));
}

function formatDuration(seconds: number | null): string {
  if (!seconds || seconds < 1) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

export default async function CallsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("calls")
    .select("id, prospect_phone, started_at, ended_at, duration_s, recording_url, zadarma_call_id")
    .order("started_at", { ascending: false });

  const rows = (data ?? []) as CallRow[];

  return (
    <main className="calls" data-testid="calls-page">
      <p className="calls__eyebrow">/hub · call history</p>
      <header className="calls__header">
        <h1>Call History</h1>
        <p>Every outbound call logged from Zadarma, newest first.</p>
      </header>

      <div className="calls__count" data-testid="calls-count" data-count={rows.length}>
        {rows.length} call{rows.length === 1 ? "" : "s"}
      </div>

      {error ? (
        <div className="calls__error" data-testid="calls-error">
          Couldn&apos;t load calls. {error.message}
        </div>
      ) : rows.length === 0 ? (
        <div className="calls__empty" data-testid="calls-empty">
          No calls yet. Make a call in Zadarma — it will appear here within seconds.
        </div>
      ) : (
        <div className="calls__table-wrap">
          <table className="calls__table" data-testid="calls-table">
            <thead>
              <tr>
                <th>Date / Time</th>
                <th>Prospect</th>
                <th>Duration</th>
                <th>Recording</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} data-testid="calls-row">
                  <td>{formatDate(r.started_at)}</td>
                  <td className="calls__phone">{r.prospect_phone}</td>
                  <td>{formatDuration(r.duration_s)}</td>
                  <td>
                    {r.recording_url ? (
                      <a
                        href={r.recording_url}
                        className="calls__play"
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid="calls-recording"
                      >
                        ▶ Play
                      </a>
                    ) : (
                      <span className="calls__no-recording">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
