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
// Phase 1B sub-2 — Live Lead Feed seed.
//
// Seeds two demo clients so the RLS isolation can be verified:
//   - PRIMARY = "demo-practice" (also created by seed-bible.mts; the demo
//     client user is linked here, and the demo CGM is assigned here).
//   - SECONDARY = "second-clinic" (no user / no CGM assignment).
//
// Expected visibility once the client + cgm fixtures are wired up:
//   admin  → 16 (all)
//   cgm    → 10 (assigned to primary only)
//   client → 10 (linked to primary)
//   …and the client must NOT see any of the 6 SECONDARY rows.
// ---------------------------------------------------------------------------

const PRIMARY_SLUG = "demo-practice";
const SECONDARY_SLUG = "second-clinic";

const day = 86_400_000;
const ago = (days: number) => new Date(Date.now() - days * day).toISOString();

type Status = "new" | "contacted" | "booked" | "lost";
type LeadSeed = {
  full_name: string;
  contact: string;
  source: string;
  suburb: string;
  status: Status;
  capturedDaysAgo: number;
  bookedDaysAgo?: number;
  notes?: string | null;
};

const PRIMARY: LeadSeed[] = [
  { full_name: "Sarah Mitchell",  contact: "sarah.m@example.com",   source: "Google Ads",              suburb: "Bondi NSW",          status: "new",       capturedDaysAgo: 2,  notes: "Enquired about cosmetic consultation" },
  { full_name: "James Wong",      contact: "0412 444 901",          source: "Facebook",                suburb: "Newtown NSW",        status: "new",       capturedDaysAgo: 4,  notes: "Interested in clear aligners" },
  { full_name: "Olivia Brown",    contact: "olivia.b@example.com",  source: "Instagram",               suburb: "Manly NSW",          status: "new",       capturedDaysAgo: 5 },
  { full_name: "Liam Patel",      contact: "0432 118 005",          source: "Google Ads",              suburb: "Surry Hills NSW",    status: "contacted", capturedDaysAgo: 8 },
  { full_name: "Emma Thompson",   contact: "emma.t@example.com",    source: "Referral",                suburb: "Paddington NSW",     status: "contacted", capturedDaysAgo: 12 },
  { full_name: "Noah Chen",       contact: "0421 776 220",          source: "Google Ads",              suburb: "Bondi NSW",          status: "booked",    capturedDaysAgo: 18, bookedDaysAgo: 15 },
  { full_name: "Ava Singh",       contact: "ava.s@example.com",     source: "Facebook",                suburb: "Newtown NSW",        status: "booked",    capturedDaysAgo: 24, bookedDaysAgo: 22 },
  { full_name: "Charlotte Lee",   contact: "0418 332 777",          source: "Direct",                  suburb: "Bondi Junction NSW", status: "booked",    capturedDaysAgo: 35, bookedDaysAgo: 32 },
  { full_name: "Jack Reilly",     contact: "jack.r@example.com",    source: "Google Ads",              suburb: "Surry Hills NSW",    status: "lost",      capturedDaysAgo: 45, notes: "Went with competitor" },
  { full_name: "Mia Foster",      contact: "0405 884 119",          source: "Google Business Profile", suburb: "Coogee NSW",         status: "lost",      capturedDaysAgo: 55 },
];

const SECONDARY: LeadSeed[] = [
  { full_name: "Henry Walsh",     contact: "henry.w@example.com",   source: "Google Ads", suburb: "Brunswick VIC",   status: "new",       capturedDaysAgo: 1 },
  { full_name: "Isla MacDonald",  contact: "0412 998 442",          source: "Facebook",   suburb: "Fitzroy VIC",     status: "new",       capturedDaysAgo: 3 },
  { full_name: "Oscar Tan",       contact: "oscar.t@example.com",   source: "Referral",   suburb: "Carlton VIC",     status: "contacted", capturedDaysAgo: 10 },
  { full_name: "Ruby Anderson",   contact: "0407 221 558",          source: "Google Ads", suburb: "Richmond VIC",    status: "booked",    capturedDaysAgo: 20, bookedDaysAgo: 17 },
  { full_name: "Ethan Nguyen",    contact: "ethan.n@example.com",   source: "Instagram",  suburb: "South Yarra VIC", status: "booked",    capturedDaysAgo: 28, bookedDaysAgo: 25 },
  { full_name: "Zara Khan",       contact: "0438 660 712",          source: "Direct",     suburb: "St Kilda VIC",    status: "lost",      capturedDaysAgo: 50 },
];

async function ensureClient(slug: string, name: string): Promise<string> {
  const { data: existing } = await admin
    .from("clients")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) return existing.id;
  const { data, error } = await admin
    .from("clients")
    .insert({ slug, name })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

function buildRows(seeds: LeadSeed[], clientId: string) {
  return seeds.map((s) => ({
    client_id: clientId,
    full_name: s.full_name,
    contact: s.contact,
    source: s.source,
    suburb: s.suburb,
    status: s.status,
    captured_at: ago(s.capturedDaysAgo),
    booked_at: s.bookedDaysAgo != null ? ago(s.bookedDaysAgo) : null,
    notes: s.notes ?? null,
  }));
}

async function run() {
  const primaryId = await ensureClient(PRIMARY_SLUG, "Demo Dental Practice");
  const secondaryId = await ensureClient(SECONDARY_SLUG, "Second Demo Clinic");
  console.log(`✓ clients ready: ${PRIMARY_SLUG} + ${SECONDARY_SLUG}`);

  // Re-seed: wipe leads belonging to the two demo clients, then reinsert.
  // Service-role client bypasses RLS; scoped to seed clients only.
  {
    const { error } = await admin
      .from("leads")
      .delete()
      .in("client_id", [primaryId, secondaryId]);
    if (error) throw error;
  }

  const rows = [...buildRows(PRIMARY, primaryId), ...buildRows(SECONDARY, secondaryId)];
  const { error } = await admin.from("leads").insert(rows);
  if (error) throw error;

  console.log(`✓ leads inserted: ${PRIMARY.length} primary + ${SECONDARY.length} secondary = ${rows.length}`);
  console.log("\nSeed complete.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
