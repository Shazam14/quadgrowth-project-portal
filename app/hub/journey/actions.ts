"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const TITLE_MAX = 200;
const DESC_MAX = 1200;

type Status = "planned" | "in_progress" | "done";

function clean(value: FormDataEntryValue | null, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function parseDate(input: FormDataEntryValue | null): string {
  const v = typeof input === "string" ? input.trim() : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    throw new Error("Date is required in YYYY-MM-DD format.");
  }
  return v;
}

function parseStatus(input: FormDataEntryValue | null): Status {
  const v = typeof input === "string" ? input.trim() : "";
  if (v === "planned" || v === "in_progress" || v === "done") return v;
  return "planned";
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

export async function createMilestone(formData: FormData) {
  const { supabase, userId } = await requireWriter();

  const clientId = clean(formData.get("client_id"), 64);
  if (!clientId) throw new Error("Client is required.");
  const title = clean(formData.get("title"), TITLE_MAX);
  if (!title) throw new Error("Title is required.");
  const occurredOn = parseDate(formData.get("occurred_on"));
  const description = clean(formData.get("description"), DESC_MAX) || null;
  const status = parseStatus(formData.get("status"));

  const { data, error } = await supabase
    .from("journey_milestones")
    .insert({
      client_id: clientId,
      title,
      description,
      occurred_on: occurredOn,
      status,
      created_by: userId,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/hub/journey");
  revalidatePath("/portal/journey");
  redirect(`/hub/journey/${data.id}`);
}

export async function updateMilestone(milestoneId: string, formData: FormData) {
  const { supabase } = await requireWriter();

  const title = clean(formData.get("title"), TITLE_MAX);
  if (!title) throw new Error("Title is required.");
  const occurredOn = parseDate(formData.get("occurred_on"));
  const description = clean(formData.get("description"), DESC_MAX) || null;
  const status = parseStatus(formData.get("status"));

  const { error } = await supabase
    .from("journey_milestones")
    .update({
      title,
      description,
      occurred_on: occurredOn,
      status,
    })
    .eq("id", milestoneId);

  if (error) throw new Error(error.message);

  revalidatePath("/hub/journey");
  revalidatePath(`/hub/journey/${milestoneId}`);
  revalidatePath("/portal/journey");
}

export async function deleteMilestone(milestoneId: string) {
  const { supabase } = await requireWriter();

  const { error } = await supabase
    .from("journey_milestones")
    .delete()
    .eq("id", milestoneId);

  if (error) throw new Error(error.message);

  revalidatePath("/hub/journey");
  revalidatePath("/portal/journey");
  redirect("/hub/journey");
}
