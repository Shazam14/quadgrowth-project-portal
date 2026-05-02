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
// Phase 1B sub-5 — Monthly Reports seed.
// Primary client: 2 published (March, April 2026) + 1 draft (May 2026).
// Secondary client: 1 published (April 2026).
// Wipe-and-reinsert by client_id, idempotent.
// ---------------------------------------------------------------------------

const PRIMARY_SLUG = "demo-practice";
const SECONDARY_SLUG = "second-clinic";

type Status = "draft" | "published";

type ReportSeed = {
  month: string; // YYYY-MM-01
  wins: [string, string, string];
  challenge: string;
  focus: string;
  status: Status;
};

const PRIMARY: ReportSeed[] = [
  {
    month: "2026-03-01",
    status: "published",
    wins: [
      "Booked 38 cosmetic consults — best month since onboarding",
      "Cost-per-lead dropped from $42 to $29 on Meta",
      "5-star review response rate hit 100% across GBP",
    ],
    challenge:
      "Friday afternoons consistently underperform — leads come in but conversion to booked appointment drops 22%.",
    focus:
      "A/B test a Friday-only landing page variant emphasising same-day callbacks, and brief reception on Friday handoff.",
  },
  {
    month: "2026-04-01",
    status: "published",
    wins: [
      "42 cosmetic consults booked (+10% MoM)",
      "Google Ads quality score lifted from 6 to 8 across 4 ad groups",
      "Landing-page conversion rose to 7.1% (was 5.4%)",
    ],
    challenge:
      "Booked-to-attended ratio slipped to 71% — no-shows are creeping up, especially for Tuesday slots.",
    focus:
      "Layer SMS reminders 24h + 2h pre-appointment, and trial a $50 deposit-to-book on cosmetic consults.",
  },
  {
    month: "2026-05-01",
    status: "draft",
    wins: [
      "Same-day Friday landing page lifted Friday bookings 31%",
      "SMS reminder rollout cut no-shows back to 84% attended",
      "First aligners enquiry came through GBP — new channel proven",
    ],
    challenge:
      "Meta CPL is creeping up post-iOS update — currently at $34, trending toward $40.",
    focus:
      "Refresh creative on top 2 lead-form ads and test a UGC-style video hook against the static carousel.",
  },
];

const SECONDARY: ReportSeed[] = [
  {
    month: "2026-04-01",
    status: "published",
    wins: [
      "First month live — 14 leads from Google Ads in week 4",
      "GBP profile fully optimised; weekly post cadence locked in",
      "Tracking + UTMs verified end-to-end with practice management",
    ],
    challenge:
      "Meta lead-form fill rate is low (8%) — copy isn't converting clinical-curious traffic.",
    focus:
      "Rewrite Meta ad copy around the aligners landing page (launches next week) and re-test fill rate.",
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

function buildRows(seeds: ReportSeed[], clientId: string) {
  return seeds.map((s) => ({
    client_id: clientId,
    month: s.month,
    wins: s.wins,
    challenge: s.challenge,
    focus: s.focus,
    status: s.status,
    published_at: s.status === "published" ? new Date().toISOString() : null,
  }));
}

async function run() {
  const primaryId = await getClientId(PRIMARY_SLUG);
  const secondaryId = await getClientId(SECONDARY_SLUG);
  console.log(`✓ clients found: ${PRIMARY_SLUG} + ${SECONDARY_SLUG}`);

  {
    const { error } = await admin
      .from("monthly_reports")
      .delete()
      .in("client_id", [primaryId, secondaryId]);
    if (error) throw error;
  }

  const rows = [...buildRows(PRIMARY, primaryId), ...buildRows(SECONDARY, secondaryId)];
  const { error } = await admin.from("monthly_reports").insert(rows);
  if (error) throw error;

  console.log(`✓ monthly_reports inserted: ${PRIMARY.length} primary + ${SECONDARY.length} secondary = ${rows.length}`);
  console.log("\nSeed complete.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
