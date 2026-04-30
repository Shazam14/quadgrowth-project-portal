"use client";

import "./calls.css";

type CallRow = {
  id: string;
  prospect_phone: string;
  started_at: string | null;
  duration_s: number | null;
  recording_url: string | null;
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

function dialNumber(phone: string) {
  const input = document.getElementById(
    "zdrm-webphone-phonenumber-input",
  ) as HTMLInputElement | null;
  if (!input) return;
  input.value = phone;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.focus();
  // Scroll widget into view in case it's off-screen
  input.closest("#zdrmWPhI")?.scrollIntoView({ behavior: "smooth", block: "end" });
}

export default function CallsTable({ rows }: { rows: CallRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="calls__empty" data-testid="calls-empty">
        No calls yet. Make a call in the widget — it will appear here within seconds.
      </div>
    );
  }

  return (
    <div className="calls__table-wrap">
      <table className="calls__table" data-testid="calls-table">
        <thead>
          <tr>
            <th>Date / Time</th>
            <th>Prospect</th>
            <th>Duration</th>
            <th>Recording</th>
            <th></th>
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
              <td>
                <button
                  className="calls__dial"
                  onClick={() => dialNumber(r.prospect_phone)}
                  data-testid="calls-dial"
                  title={`Call ${r.prospect_phone}`}
                >
                  📞 Call
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
