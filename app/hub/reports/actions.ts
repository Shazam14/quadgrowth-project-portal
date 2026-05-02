"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const MAX_LEN = 600;

type Status = "draft" | "published";

function clean(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim().slice(0, MAX_LEN) : "";
}

function parseMonth(input: FormDataEntryValue | null): string {
  // Accepts "YYYY-MM" (HTML month input) and returns "YYYY-MM-01".
  const v = typeof input === "string" ? input.trim() : "";
  if (!/^\d{4}-\d{2}$/.test(v)) {
    throw new Error("Month must be in YYYY-MM format.");
  }
  return `${v}-01`;
}

function readWins(formData: FormData): string[] {
  const wins = [
    clean(formData.get("win_1")),
    clean(formData.get("win_2")),
    clean(formData.get("win_3")),
  ].filter((w) => w.length > 0);
  if (wins.length === 0) {
    throw new Error("At least one win is required.");
  }
  return wins;
}

async function requireWriter() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "cgm" && profile?.role !== "admin") {
    throw new Error("Not authorized.");
  }
  return { supabase, userId: user.id };
}

export async function createReport(formData: FormData) {
  const { supabase, userId } = await requireWriter();

  const clientId = clean(formData.get("client_id"));
  if (!clientId) throw new Error("Client is required.");
  const month = parseMonth(formData.get("month"));
  const wins = readWins(formData);
  const challenge = clean(formData.get("challenge")) || null;
  const focus = clean(formData.get("focus")) || null;
  const status: Status =
    clean(formData.get("intent")) === "publish" ? "published" : "draft";

  const { data, error } = await supabase
    .from("monthly_reports")
    .insert({
      client_id: clientId,
      month,
      wins,
      challenge,
      focus,
      status,
      written_by: userId,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/hub/reports");
  revalidatePath("/portal/reports");
  redirect(`/hub/reports/${data.id}`);
}

export async function updateReport(reportId: string, formData: FormData) {
  const { supabase } = await requireWriter();

  const month = parseMonth(formData.get("month"));
  const wins = readWins(formData);
  const challenge = clean(formData.get("challenge")) || null;
  const focus = clean(formData.get("focus")) || null;
  const intent = clean(formData.get("intent"));

  const patch: Record<string, unknown> = { month, wins, challenge, focus };

  if (intent === "publish") {
    patch.status = "published";
    patch.published_at = new Date().toISOString();
  } else if (intent === "unpublish") {
    patch.status = "draft";
    patch.published_at = null;
  }

  const { error } = await supabase
    .from("monthly_reports")
    .update(patch)
    .eq("id", reportId);

  if (error) throw new Error(error.message);

  revalidatePath("/hub/reports");
  revalidatePath(`/hub/reports/${reportId}`);
  revalidatePath("/portal/reports");
}

export async function deleteDraft(reportId: string) {
  const { supabase } = await requireWriter();

  const { error } = await supabase
    .from("monthly_reports")
    .delete()
    .eq("id", reportId);

  if (error) throw new Error(error.message);

  revalidatePath("/hub/reports");
  redirect("/hub/reports");
}
