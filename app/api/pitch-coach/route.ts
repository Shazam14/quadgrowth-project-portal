import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { createClient } from "@/lib/supabase/server";
import { getScenario, SUBURBS } from "@/app/hub/pitch-coach/_data/scenarios";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are the QuadGrowth Pitch Coach — a sharp, friendly AI sparring partner for Campaign Growth Managers (CGMs) who run B2B lead generation for clients.

The user is a CGM. They will paste in a pitch, an objection, a lead profile, or a scenario. Your job:
1. If they share a pitch or message → critique it: what's strong, what's weak, what to cut, one rewrite suggestion.
2. If they share an objection → give a concise reframe and 1-2 sample responses.
3. If they share a lead profile → give 3 discovery questions tailored to that prospect.
4. If they share a scenario → role-play briefly and give the next move.

Keep responses tight (under 200 words unless asked). Plain Australian English. No corporate fluff. Bullets > paragraphs. End with one concrete next action labelled "Next move:".`;

type ChatMessage = { role: "user" | "assistant"; content: string };

function buildSystemPrompt(scenarioId: string | undefined, suburb: string | undefined): string {
  const lines: string[] = [SYSTEM_PROMPT];
  const scenario = scenarioId ? getScenario(scenarioId) : undefined;
  const validSuburb = suburb && SUBURBS.includes(suburb) ? suburb : undefined;
  if (scenario || validSuburb) {
    lines.push("\nSession context:");
    if (scenario) lines.push(`- Scenario: ${scenario.label} — ${scenario.promptHint}`);
    if (validSuburb)
      lines.push(`- Lead location: ${validSuburb}, Australia. Frame language for that market.`);
  }
  return lines.join("\n");
}

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

  const body = (await req.json()) as {
    messages?: ChatMessage[];
    scenario?: string;
    suburb?: string;
  };
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return new Response("messages required", { status: 400 });
  }

  const result = streamText({
    model: google("gemma-3-27b-it"),
    system: buildSystemPrompt(body.scenario, body.suburb),
    messages,
    onError: ({ error }) => {
      console.error("[pitch-coach] stream error:", error);
    },
  });

  return result.toTextStreamResponse();
}
