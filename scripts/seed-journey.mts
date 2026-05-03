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
// Phase 1B sub-7 — Journey Timeline seed.
// Primary client: 5-step engagement arc (3 done, 1 in-progress, 1 planned).
// Secondary client: 3 milestones (RLS isolation canary).
// Wipe-and-reinsert by client_id, idempotent.
// ---------------------------------------------------------------------------

const PRIMARY_SLUG = "demo-practice";
const SECONDARY_SLUG = "second-clinic";

type Status = "planned" | "in_progress" | "done";

type MilestoneSeed = {
  title: string;
  description: string | null;
  occurred_on: string; // YYYY-MM-DD
  status: Status;
};

const PRIMARY: MilestoneSeed[] = [
  {
    title: "Discovery call",
    description: "60-minute kickoff with practice owner. Mapped current acquisition channels, set 6-month bookings target, agreed on weekly Slack cadence.",
    occurred_on: "2026-02-10",
    status: "done",
  },
  {
    title: "Audit + tracking setup",
    description: "Full GA4 + Meta Pixel audit. Fixed 4 broken conversion events. Booked-call event firing cleanly from receptionist CRM by 28 Feb.",
    occurred_on: "2026-02-25",
    status: "done",
  },
  {
    title: "Campaign launch · Google + Meta",
    description: "First creative pack live. $4k/mo across Google Ads (search + brand) and Meta (lead-form + reels). First booked lead inside 9 days.",
    occurred_on: "2026-03-15",
    status: "done",
  },
  {
    title: "Optimisation cycle Q1",
    description: "Iterating on headline + suburb-specific creative. Currently testing $50 deposit-to-book on cosmetic consults to lift show-rate.",
    occurred_on: "2026-04-20",
    status: "in_progress",
  },
  {
    title: "Aligners landing page launch",
    description: "Dedicated funnel for clear-aligners offer. New creative pack, post-launch review on the June strategy call.",
    occurred_on: "2026-06-01",
    status: "planned",
  },
];

const SECONDARY: MilestoneSeed[] = [
  {
    title: "Inner Melbourne discovery",
    description: "Kickoff call with inner-Melbourne clinic. Focus on aligners + cosmetic veneers vertical.",
    occurred_on: "2026-03-05",
    status: "done",
  },
  {
    title: "Inner Melbourne campaign launch",
    description: "Meta lead-form + GBP refresh shipped. First wave of creatives running mid-March.",
    occurred_on: "2026-03-20",
    status: "in_progress",
  },
  {
    title: "Inner Melbourne aligners debrief",
    description: "First-month aligners launch debrief on the June 19 strategy call.",
    occurred_on: "2026-06-19",
    status: "planned",
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

function buildRows(seeds: MilestoneSeed[], clientId: string) {
  return seeds.map((s) => ({
    client_id: clientId,
    title: s.title,
    description: s.description,
    occurred_on: s.occurred_on,
    status: s.status,
  }));
}

async function run() {
  const primaryId = await getClientId(PRIMARY_SLUG);
  const secondaryId = await getClientId(SECONDARY_SLUG);
  console.log(`✓ clients found: ${PRIMARY_SLUG} + ${SECONDARY_SLUG}`);

  {
    const { error } = await admin
      .from("journey_milestones")
      .delete()
      .in("client_id", [primaryId, secondaryId]);
    if (error) throw error;
  }

  const rows = [...buildRows(PRIMARY, primaryId), ...buildRows(SECONDARY, secondaryId)];
  const { error } = await admin.from("journey_milestones").insert(rows);
  if (error) throw error;

  console.log(`✓ journey_milestones inserted: ${PRIMARY.length} primary + ${SECONDARY.length} secondary = ${rows.length}`);
  console.log("\nSeed complete.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
