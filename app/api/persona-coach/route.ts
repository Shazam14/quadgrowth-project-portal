import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { createClient } from "@/lib/supabase/server";
import { getPersona } from "@/app/hub/persona-coach/_data/personas";

export const runtime = "nodejs";
export const maxDuration = 60;

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || (profile.role !== "cgm" && profile.role !== "admin")) {
    return new Response("Forbidden", { status: 403 });
  }

  const body = (await req.json()) as { personaId?: string; messages?: ChatMessage[] };
  const persona = getPersona(body.personaId ?? "");
  if (!persona) return new Response("invalid personaId", { status: 400 });

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return new Response("messages required", { status: 400 });
  }

  const result = streamText({
    model: google("gemma-3-27b-it"),
    system: persona.systemPrompt,
    messages,
    onError: ({ error }) => {
      console.error("[persona-coach] stream error:", error);
    },
  });

  return result.toTextStreamResponse();
}
