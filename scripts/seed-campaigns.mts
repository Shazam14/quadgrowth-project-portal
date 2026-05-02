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
// Phase 1B sub-4 — Campaign Status seed.
// 4 channels × 2 demo clients = 8 rows.
// Both demo clients are created by seed-leads.mts; this script assumes they
// already exist.
// ---------------------------------------------------------------------------

const PRIMARY_SLUG = "demo-practice";
const SECONDARY_SLUG = "second-clinic";

type Channel = "google_ads" | "meta_ads" | "gbp" | "landing_page";
type Status = "live" | "paused" | "setup";

type CampaignSeed = {
  channel: Channel;
  status: Status;
  notes: string | null;
  startedDaysAgo: number | null;
};

const day = 86_400_000;
const daysAgoDate = (n: number): string =>
  new Date(Date.now() - n * day).toISOString().slice(0, 10);

const PRIMARY: CampaignSeed[] = [
  { channel: "google_ads",   status: "live",   notes: "Search + Performance Max — booking-focused keywords",     startedDaysAgo: 42 },
  { channel: "meta_ads",     status: "live",   notes: "Lead-form ads, Bondi & Eastern Suburbs targeting",        startedDaysAgo: 35 },
  { channel: "gbp",          status: "live",   notes: "Weekly posts + review responses managed by QuadGrowth",   startedDaysAgo: 60 },
  { channel: "landing_page", status: "live",   notes: "Cosmetic consult landing page — A/B test underway",       startedDaysAgo: 28 },
];

const SECONDARY: CampaignSeed[] = [
  { channel: "google_ads",   status: "live",   notes: "Search-only campaign across Inner Melbourne",              startedDaysAgo: 21 },
  { channel: "meta_ads",     status: "paused", notes: "Paused mid-month pending creative refresh",                startedDaysAgo: 14 },
  { channel: "gbp",          status: "live",   notes: "Profile claimed and optimised; weekly post cadence",       startedDaysAgo: 30 },
  { channel: "landing_page", status: "setup",  notes: "New aligners landing page in build — launching next week", startedDaysAgo: null },
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

function buildRows(seeds: CampaignSeed[], clientId: string) {
  return seeds.map((s) => ({
    client_id: clientId,
    channel: s.channel,
    status: s.status,
    notes: s.notes,
    started_at: s.startedDaysAgo != null ? daysAgoDate(s.startedDaysAgo) : null,
  }));
}

async function run() {
  const primaryId = await getClientId(PRIMARY_SLUG);
  const secondaryId = await getClientId(SECONDARY_SLUG);
  console.log(`✓ clients found: ${PRIMARY_SLUG} + ${SECONDARY_SLUG}`);

  // Wipe-and-reinsert for the two demo clients so counts stay stable.
  {
    const { error } = await admin
      .from("campaigns")
      .delete()
      .in("client_id", [primaryId, secondaryId]);
    if (error) throw error;
  }

  const rows = [...buildRows(PRIMARY, primaryId), ...buildRows(SECONDARY, secondaryId)];
  const { error } = await admin.from("campaigns").insert(rows);
  if (error) throw error;

  console.log(`✓ campaigns inserted: ${PRIMARY.length} primary + ${SECONDARY.length} secondary = ${rows.length}`);
  console.log("\nSeed complete.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
