"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const NAME_MAX = 200;
const EMAIL_MAX = 320;
const NOTES_MAX = 1200;

type Tier = "starter" | "growth" | "scale";

function clean(value: FormDataEntryValue | null, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function parseTier(input: FormDataEntryValue | null): Tier {
  const v = typeof input === "string" ? input.trim() : "";
  if (v === "starter" || v === "growth" || v === "scale") return v;
  return "starter";
}

function parseDateOrNull(input: FormDataEntryValue | null): string | null {
  const v = typeof input === "string" ? input.trim() : "";
  if (!v) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    throw new Error("Renewal date must be YYYY-MM-DD.");
  }
  return v;
}

function parseMoneyOrNull(input: FormDataEntryValue | null): number | null {
  const v = typeof input === "string" ? input.trim() : "";
  if (!v) return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error("Monthly value must be a non-negative number.");
  }
  return Math.round(n * 100) / 100;
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    throw new Error("Not authorized — admin only.");
  }
  return { supabase };
}

export async function upsertPackage(clientId: string, formData: FormData) {
  const { supabase } = await requireAdmin();

  if (!clientId) throw new Error("Client is required.");

  const planTier = parseTier(formData.get("plan_tier"));
  const monthlyValue = parseMoneyOrNull(formData.get("monthly_value"));
  const billingContactName =
    clean(formData.get("billing_contact_name"), NAME_MAX) || null;
  const billingContactEmail =
    clean(formData.get("billing_contact_email"), EMAIL_MAX) || null;
  const renewalDate = parseDateOrNull(formData.get("renewal_date"));
  const notes = clean(formData.get("notes"), NOTES_MAX) || null;

  const { error } = await supabase.from("client_packages").upsert(
    {
      client_id: clientId,
      plan_tier: planTier,
      monthly_value: monthlyValue,
      billing_contact_name: billingContactName,
      billing_contact_email: billingContactEmail,
      renewal_date: renewalDate,
      notes,
    },
    { onConflict: "client_id" },
  );

  if (error) throw new Error(error.message);

  revalidatePath("/hub/package");
  revalidatePath("/portal/package");
}
