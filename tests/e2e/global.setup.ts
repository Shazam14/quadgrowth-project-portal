import { test as setup, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

loadEnv({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing Supabase env vars: ensure .env.local has NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY",
  );
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ADMIN_AUTH_FILE = "tests/.auth/admin.json";
const CGM_AUTH_FILE = "tests/.auth/cgm.json";
const CLIENT_AUTH_FILE = "tests/.auth/client.json";

const ADMIN_EMAIL = "shazflicks@gmail.com";
const CGM_EMAIL = "cgm-demo@quadgrowth.com.au";
const CLIENT_EMAIL = "client-demo@quadgrowth.com.au";
const CLIENT_DEMO_SLUG = "demo-practice";

type Role = "client" | "cgm" | "admin";

async function ensureUser(
  email: string,
  role: Role,
  fullName: string,
  clientId: string | null = null,
) {
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listErr) throw listErr;
  let userId = list?.users.find((u) => u.email === email)?.id;
  if (!userId) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    if (error) throw error;
    userId = data.user.id;
  }
  // Trigger created profile with role='client'; force the desired role.
  const { error: upErr } = await admin
    .from("profiles")
    .update({ role, full_name: fullName, client_id: clientId })
    .eq("id", userId);
  if (upErr) throw upErr;
  return userId;
}

async function getDemoClientId(slug: string): Promise<string> {
  const { data, error } = await admin
    .from("clients")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    throw new Error(
      `Demo client "${slug}" not found. Run "npm run seed" (and "npm run seed:leads") before tests.`,
    );
  }
  return data.id;
}

async function saveAuthFor(
  page: import("@playwright/test").Page,
  email: string,
  file: string,
) {
  // Hits the dev-only /auth/test-signin route which calls verifyOtp
  // server-side and sets sb-* cookies on the response.
  await page.goto(`/auth/test-signin?email=${encodeURIComponent(email)}`);
  await page.waitForURL(
    (url) => !url.toString().includes("/auth/test-signin"),
    { timeout: 15_000 },
  );
  await expect(page).toHaveURL(/localhost:3000/);

  const dir = dirname(file);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  await page.context().storageState({ path: file });
}

setup("authenticate as admin", async ({ page }) => {
  await ensureUser(ADMIN_EMAIL, "admin", "Archimedes");
  await saveAuthFor(page, ADMIN_EMAIL, ADMIN_AUTH_FILE);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin/);
});

setup("authenticate as cgm", async ({ page }) => {
  const demoClientId = await getDemoClientId(CLIENT_DEMO_SLUG);
  const cgmId = await ensureUser(CGM_EMAIL, "cgm", "Demo CGM");
  // Idempotently assign demo CGM to demo-practice so RLS-scoped reads work.
  const { error: assignErr } = await admin
    .from("client_assignments")
    .upsert(
      { cgm_id: cgmId, client_id: demoClientId },
      { onConflict: "cgm_id,client_id", ignoreDuplicates: true },
    );
  if (assignErr) throw assignErr;
  await saveAuthFor(page, CGM_EMAIL, CGM_AUTH_FILE);
  await page.goto("/hub");
  await expect(page).toHaveURL(/\/hub/);
});

setup("authenticate as client", async ({ page }) => {
  const demoClientId = await getDemoClientId(CLIENT_DEMO_SLUG);
  await ensureUser(CLIENT_EMAIL, "client", "Demo Client", demoClientId);
  await saveAuthFor(page, CLIENT_EMAIL, CLIENT_AUTH_FILE);
  await page.goto("/portal");
  await expect(page).toHaveURL(/\/portal/);
});
