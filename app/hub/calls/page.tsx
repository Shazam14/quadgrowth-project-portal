import { createClient } from "@/lib/supabase/server";
import "./calls.css";
import CallsTable from "./CallsTable";

export const metadata = { title: "Call History" };
export const dynamic = "force-dynamic";

type CallRow = {
  id: string;
  prospect_phone: string;
  started_at: string | null;
  duration_s: number | null;
  recording_url: string | null;
};

export default async function CallsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("calls")
    .select("id, prospect_phone, started_at, duration_s, recording_url")
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
      ) : (
        <CallsTable rows={rows} />
      )}
    </main>
  );
}
