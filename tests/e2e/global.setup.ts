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

const ADMIN_EMAIL = "shazflicks@gmail.com";
const CGM_EMAIL = "cgm-demo@quadgrowth.com.au";

type Role = "client" | "cgm" | "admin";

async function ensureUser(email: string, role: Role, fullName: string) {
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
    .update({ role, full_name: fullName })
    .eq("id", userId);
  if (upErr) throw upErr;
  return userId;
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
  await ensureUser(CGM_EMAIL, "cgm", "Demo CGM");
  await saveAuthFor(page, CGM_EMAIL, CGM_AUTH_FILE);
  await page.goto("/hub");
  await expect(page).toHaveURL(/\/hub/);
});
