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
// Phase 1B sub-8 — Package & Account seed.
// One row per client (PK = client_id). Upsert on conflict.
// ---------------------------------------------------------------------------

const PRIMARY_SLUG = "demo-practice";
const SECONDARY_SLUG = "second-clinic";

type PackageSeed = {
  plan_tier: "starter" | "growth" | "scale";
  monthly_value: number;
  billing_contact_name: string;
  billing_contact_email: string;
  renewal_date: string; // YYYY-MM-DD
  notes: string;
};

const PRIMARY: PackageSeed = {
  plan_tier: "growth",
  monthly_value: 4500.0,
  billing_contact_name: "Dr Aisha Patel",
  billing_contact_email: "billing@demopractice.com.au",
  renewal_date: "2026-12-15",
  notes: "12-month locked commitment with quarterly review. Auto-renews unless 60-day notice given.",
};

const SECONDARY: PackageSeed = {
  plan_tier: "starter",
  monthly_value: 2200.0,
  billing_contact_name: "Practice Manager",
  billing_contact_email: "admin@secondclinic.com.au",
  renewal_date: "2026-09-30",
  notes: "Month-to-month rolling contract. Reviewing tier upgrade after Aligners launch.",
};

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

async function run() {
  const primaryId = await getClientId(PRIMARY_SLUG);
  const secondaryId = await getClientId(SECONDARY_SLUG);
  console.log(`✓ clients found: ${PRIMARY_SLUG} + ${SECONDARY_SLUG}`);

  const rows = [
    { client_id: primaryId, ...PRIMARY },
    { client_id: secondaryId, ...SECONDARY },
  ];

  const { error } = await admin
    .from("client_packages")
    .upsert(rows, { onConflict: "client_id" });
  if (error) throw error;

  console.log(`✓ client_packages upserted: ${rows.length}`);
  console.log("\nSeed complete.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
