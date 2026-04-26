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
// Source data — derived from quadgrowth-lead/guide.md §5
// ---------------------------------------------------------------------------

const CATEGORIES = [
  { id: "advertising",  label: "📢 Advertising",     sort_order: 1 },
  { id: "pm",           label: "🗂 Project Mgmt",    sort_order: 2 },
  { id: "comms",        label: "💬 Comms",           sort_order: 3 },
  { id: "infra",        label: "⚙️ Infrastructure",  sort_order: 4 },
  { id: "client_tools", label: "🦷 Client Tools",    sort_order: 5 },
  { id: "finance",      label: "💳 Finance",         sort_order: 6 },
];

type EntrySeed = {
  category_id: string;
  name: string;
  icon: string;
  url: string | null;
  login: string;
  notes: string | null;
};

const ENTRIES: EntrySeed[] = [
  { category_id: "advertising",  name: "Google Ads",                       icon: "📢", url: "ads.google.com",       login: "REPLACE_ME", notes: null },
  { category_id: "advertising",  name: "Meta Business Suite",              icon: "📢", url: "business.facebook.com", login: "REPLACE_ME", notes: null },
  { category_id: "advertising",  name: "Google Business Profile (Agency)", icon: "📢", url: "business.google.com",  login: "REPLACE_ME", notes: null },
  { category_id: "pm",           name: "Jira",                             icon: "🗂", url: "chobe.atlassian.net",  login: "REPLACE_ME", notes: null },
  { category_id: "pm",           name: "Airtable CRM",                     icon: "🗂", url: "airtable.com",         login: "REPLACE_ME", notes: null },
  { category_id: "pm",           name: "n8n Automation",                   icon: "🗂", url: null,                   login: "REPLACE_ME", notes: null },
  { category_id: "comms",        name: "Google Workspace (Email Admin)",   icon: "💬", url: "admin.google.com",     login: "REPLACE_ME", notes: null },
  { category_id: "comms",        name: "Slack",                            icon: "💬", url: "slack.com",            login: "REPLACE_ME", notes: null },
  { category_id: "comms",        name: "Calendly",                         icon: "💬", url: "calendly.com",         login: "REPLACE_ME", notes: null },
  { category_id: "infra",        name: "Domain Registrar",                 icon: "⚙️", url: null,                   login: "REPLACE_ME", notes: null },
  { category_id: "infra",        name: "Website Hosting",                  icon: "⚙️", url: "vercel.com",           login: "REPLACE_ME", notes: null },
  { category_id: "infra",        name: "Anthropic API (Claude)",           icon: "⚙️", url: "console.anthropic.com", login: "REPLACE_ME", notes: null },
  { category_id: "client_tools", name: "Outscraper",                       icon: "🦷", url: "outscraper.com",       login: "REPLACE_ME", notes: null },
  { category_id: "client_tools", name: "Client Reporting Dashboard",       icon: "🦷", url: null,                   login: "REPLACE_ME", notes: null },
  { category_id: "finance",      name: "Accounting Software (Xero)",       icon: "💳", url: "xero.com",             login: "REPLACE_ME", notes: null },
  { category_id: "finance",      name: "DocuSign / Contract Signing",      icon: "💳", url: "docusign.com",         login: "REPLACE_ME", notes: null },
];

const PEOPLE = ["Jordan", "Member 2", "Member 3", "Member 4", "Member 5"];

const DEMO_CGM_EMAIL = "cgm-demo@quadgrowth.com.au";
const ADMIN_EMAIL = "shazflicks@gmail.com";

// ---------------------------------------------------------------------------

async function ensureCgmUser(): Promise<string> {
  const { data: list, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  let id = list?.users.find((u) => u.email === DEMO_CGM_EMAIL)?.id;
  if (!id) {
    const { data, error: createErr } = await admin.auth.admin.createUser({
      email: DEMO_CGM_EMAIL,
      email_confirm: true,
    });
    if (createErr) throw createErr;
    id = data.user.id;
  }
  await admin
    .from("profiles")
    .update({ role: "cgm", full_name: "Demo CGM" })
    .eq("id", id);
  return id;
}

async function getAdminUserId(): Promise<string> {
  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const id = list?.users.find((u) => u.email === ADMIN_EMAIL)?.id;
  if (!id) throw new Error(`Admin user ${ADMIN_EMAIL} not found`);
  return id;
}

async function run() {
  // 1. Categories — upsert by PK
  {
    const { error } = await admin
      .from("bible_categories")
      .upsert(CATEGORIES, { onConflict: "id" });
    if (error) throw error;
    console.log(`✓ categories: ${CATEGORIES.length}`);
  }

  // 2. Entries — no natural unique key, so query existing & insert missing
  const { data: existing, error: exErr } = await admin
    .from("bible_entries")
    .select("id, category_id, name");
  if (exErr) throw exErr;
  const existingSet = new Set((existing ?? []).map((r) => `${r.category_id}::${r.name}`));
  const toInsert = ENTRIES.filter((e) => !existingSet.has(`${e.category_id}::${e.name}`));
  let allEntries = (existing ?? []) as { id: string; category_id: string; name: string }[];
  if (toInsert.length > 0) {
    const { data: inserted, error: insErr } = await admin
      .from("bible_entries")
      .insert(toInsert)
      .select("id, category_id, name");
    if (insErr) throw insErr;
    allEntries = [...allEntries, ...(inserted ?? [])];
  }
  console.log(`✓ entries: +${toInsert.length} (total ${allEntries.length})`);

  // 3. Credentials — REPLACE_ME for each entry
  {
    const rows = allEntries.map((e) => ({ entry_id: e.id, password: "REPLACE_ME" }));
    const { error } = await admin
      .from("bible_credentials")
      .upsert(rows, { onConflict: "entry_id" });
    if (error) throw error;
    console.log(`✓ credentials: ${rows.length}`);
  }

  // 4. Access matrix — Jordan=admin everywhere, others=no
  {
    const rows = allEntries.flatMap((e) =>
      PEOPLE.map((p) => ({
        entry_id: e.id,
        person_label: p,
        level: p === "Jordan" ? "admin" : "no",
      })),
    );
    const { error } = await admin
      .from("bible_access")
      .upsert(rows, { onConflict: "entry_id,person_label" });
    if (error) throw error;
    console.log(`✓ access rows: ${rows.length}`);
  }

  // 5. Demo client + CGM assignment
  let demoClientId: string;
  {
    const { data: existingClient } = await admin
      .from("clients")
      .select("id")
      .eq("slug", "demo-practice")
      .maybeSingle();
    if (existingClient) {
      demoClientId = existingClient.id;
    } else {
      const { data, error } = await admin
        .from("clients")
        .insert({ name: "Demo Dental Practice", slug: "demo-practice" })
        .select("id")
        .single();
      if (error) throw error;
      demoClientId = data.id;
    }
    console.log(`✓ demo client: ${demoClientId}`);
  }

  const cgmId = await ensureCgmUser();
  const adminUserId = await getAdminUserId();
  {
    const { error } = await admin
      .from("client_assignments")
      .upsert(
        [{ cgm_id: cgmId, client_id: demoClientId, assigned_by: adminUserId }],
        { onConflict: "cgm_id,client_id" },
      );
    if (error) throw error;
    console.log(`✓ CGM↔client assignment ready`);
  }

  console.log("\nSeed complete.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
