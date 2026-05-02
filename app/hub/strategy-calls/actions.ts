"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseSydneyDatetimeLocal } from "./time";

const MAX_LEN = 1200;

type Status = "scheduled" | "completed" | "cancelled";

function clean(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim().slice(0, MAX_LEN) : "";
}

function parseScheduled(input: FormDataEntryValue | null): string {
  const v = typeof input === "string" ? input.trim() : "";
  return parseSydneyDatetimeLocal(v);
}

function parseStatus(input: FormDataEntryValue | null): Status {
  const v = clean(input);
  if (v === "scheduled" || v === "completed" || v === "cancelled") return v;
  return "scheduled";
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

export async function createCall(formData: FormData) {
  const { supabase, userId } = await requireWriter();

  const clientId = clean(formData.get("client_id"));
  if (!clientId) throw new Error("Client is required.");
  const scheduledFor = parseScheduled(formData.get("scheduled_for"));
  const meetingUrl = clean(formData.get("meeting_url")) || null;
  const agenda = clean(formData.get("agenda")) || null;

  const { data, error } = await supabase
    .from("strategy_calls")
    .insert({
      client_id: clientId,
      scheduled_for: scheduledFor,
      meeting_url: meetingUrl,
      agenda,
      status: "scheduled",
      created_by: userId,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/hub/strategy-calls");
  revalidatePath("/portal/strategy-calls");
  redirect(`/hub/strategy-calls/${data.id}`);
}

export async function updateCall(callId: string, formData: FormData) {
  const { supabase } = await requireWriter();

  const scheduledFor = parseScheduled(formData.get("scheduled_for"));
  const meetingUrl = clean(formData.get("meeting_url")) || null;
  const agenda = clean(formData.get("agenda")) || null;
  const recap = clean(formData.get("recap")) || null;
  const status = parseStatus(formData.get("status"));

  const { error } = await supabase
    .from("strategy_calls")
    .update({
      scheduled_for: scheduledFor,
      meeting_url: meetingUrl,
      agenda,
      recap,
      status,
    })
    .eq("id", callId);

  if (error) throw new Error(error.message);

  revalidatePath("/hub/strategy-calls");
  revalidatePath(`/hub/strategy-calls/${callId}`);
  revalidatePath("/portal/strategy-calls");
}

export async function deleteCall(callId: string) {
  const { supabase } = await requireWriter();

  const { error } = await supabase
    .from("strategy_calls")
    .delete()
    .eq("id", callId);

  if (error) throw new Error(error.message);

  revalidatePath("/hub/strategy-calls");
  redirect("/hub/strategy-calls");
}
