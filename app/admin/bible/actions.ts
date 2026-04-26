"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function str(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export async function upsertEntry(formData: FormData) {
  const supabase = await createClient();
  const id = str(formData.get("id"));
  const password = str(formData.get("password"));

  const fields = {
    category_id: str(formData.get("category_id")),
    name: str(formData.get("name")),
    icon: str(formData.get("icon")),
    url: str(formData.get("url")),
    login: str(formData.get("login")),
    notes: str(formData.get("notes")),
  };

  if (!fields.category_id || !fields.name) {
    throw new Error("Category and name are required");
  }

  let entryId: string;
  if (id) {
    const { error } = await supabase
      .from("bible_entries")
      .update(fields)
      .eq("id", id);
    if (error) throw error;
    entryId = id;
  } else {
    const { data, error } = await supabase
      .from("bible_entries")
      .insert(fields)
      .select("id")
      .single();
    if (error) throw error;
    entryId = data.id;
  }

  if (password) {
    const { error } = await supabase
      .from("bible_credentials")
      .upsert(
        { entry_id: entryId, password },
        { onConflict: "entry_id" },
      );
    if (error) throw error;
  }

  revalidatePath("/admin/bible");
  revalidatePath("/hub/bible");
}
