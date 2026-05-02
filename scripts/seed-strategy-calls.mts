import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------------------------------------------------------------------------
// Phase 1B sub-6 — Strategy Calls seed.
// Primary client: 1 upcoming scheduled + 1 past completed (with recap).
// Secondary client: 1 upcoming scheduled (RLS isolation canary).
// Wipe-and-reinsert by client_id, idempotent.
// ---------------------------------------------------------------------------

const PRIMARY_SLUG = "demo-practice";
const SECONDARY_SLUG = "second-clinic";

type Status = "scheduled" | "completed" | "cancelled";

type CallSeed = {
  scheduled_for: string; // ISO timestamp
  meeting_url: string | null;
  agenda: string | null;
  recap: string | null;
  status: Status;
};

const PRIMARY: CallSeed[] = [
  {
    scheduled_for: "2026-06-12T04:00:00.000Z", // Fri 12 Jun 2026, 14:00 AEST
    meeting_url: "https://meet.google.com/qgr-demo-strat",
    agenda:
      "Review May performance vs target · approve June creative refresh · lock aligners landing-page launch date.",
    recap: null,
    status: "scheduled",
  },
  {
    scheduled_for: "2026-04-11T04:00:00.000Z", // Sat 11 Apr 2026, 14:00 AEST
    meeting_url: "https://meet.google.com/qgr-demo-strat",
    agenda:
      "April kickoff: confirm tracking is verified, walk through cosmetic-consults funnel, agree on no-show experiment.",
    recap:
      "Locked SMS-reminder rollout starting 15 Apr; 24h + 2h cadence. Agreed to trial $50 deposit-to-book on cosmetic consults from 1 May. Clinic to flag any reception pushback within 7 days.",
    status: "completed",
  },
];

const SECONDARY: CallSeed[] = [
  {
    scheduled_for: "2026-06-19T00:00:00.000Z", // Fri 19 Jun 2026, 10:00 AEST
    meeting_url: "https://meet.google.com/qgr-inner-strat",
    agenda:
      "Inner Melbourne aligners launch debrief · Meta lead-form copy variants · GBP cadence review.",
    recap: null,
    status: "scheduled",
  },
];

async function getClientId(slug: string): Promise<string> {
  const { data, error } = await admin
    .from("clients")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`Client "${slug}" not found — run seed-leads first.`);
  return data.id;
}

function buildRows(seeds: CallSeed[], clientId: string) {
  return seeds.map((s) => ({
    client_id: clientId,
    scheduled_for: s.scheduled_for,
    meeting_url: s.meeting_url,
    agenda: s.agenda,
    recap: s.recap,
    status: s.status,
  }));
}

async function run() {
  const primaryId = await getClientId(PRIMARY_SLUG);
  const secondaryId = await getClientId(SECONDARY_SLUG);
  console.log(`✓ clients found: ${PRIMARY_SLUG} + ${SECONDARY_SLUG}`);

  {
    const { error } = await admin
      .from("strategy_calls")
      .delete()
      .in("client_id", [primaryId, secondaryId]);
    if (error) throw error;
  }

  const rows = [...buildRows(PRIMARY, primaryId), ...buildRows(SECONDARY, secondaryId)];
  const { error } = await admin.from("strategy_calls").insert(rows);
  if (error) throw error;

  console.log(`✓ strategy_calls inserted: ${PRIMARY.length} primary + ${SECONDARY.length} secondary = ${rows.length}`);
  console.log("\nSeed complete.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
