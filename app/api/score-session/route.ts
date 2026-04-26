import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type ChatMessage = { role: "user" | "assistant"; content: string };

type Scorecard = {
  metrics: {
    clarity: number;
    relevance: number;
    objection_handling: number;
    rapport: number;
    cta_strength: number;
  };
  overall: number;
  strengths: string[];
  improvements: string[];
  suggested_rewrite: string;
  summary: string;
};

const SYSTEM_PROMPT = `You are a B2B sales coach scoring a practice sales session for a Campaign Growth Manager (CGM) at QuadGrowth, a lead-generation agency.

You will be given the full transcript. Score the rep's performance across five metrics on a 0–10 scale, give an overall score, list strengths and improvements, propose one rewritten line they could have used, and write a one-paragraph summary.

You MUST return only valid JSON matching this exact shape — no prose, no code fences, no commentary outside the JSON:

{
  "metrics": {
    "clarity": <0-10 integer>,
    "relevance": <0-10 integer>,
    "objection_handling": <0-10 integer>,
    "rapport": <0-10 integer>,
    "cta_strength": <0-10 integer>
  },
  "overall": <0-10 integer>,
  "strengths": [<2-4 short strings>],
  "improvements": [<2-4 short strings>],
  "suggested_rewrite": <one short string — a single rewritten line the rep could have said>,
  "summary": <one short paragraph in Australian English, 2-3 sentences>
}

Be specific. Reference what the rep actually said. Plain Australian English. No fluff.`;

function transcriptText(messages: ChatMessage[], assistantLabel: string): string {
  return messages
    .map((m) => `${m.role === "user" ? "Rep" : assistantLabel}: ${m.content}`)
    .join("\n\n");
}

function clampInt(value: unknown, min = 0, max = 10): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function asStringArray(value: unknown, max = 6): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .slice(0, max)
    .map((v) => v.trim());
}

function parseScorecard(raw: string): Scorecard | null {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const obj = parsed as Record<string, unknown>;
  const metricsRaw = (obj.metrics ?? {}) as Record<string, unknown>;
  return {
    metrics: {
      clarity: clampInt(metricsRaw.clarity),
      relevance: clampInt(metricsRaw.relevance),
      objection_handling: clampInt(metricsRaw.objection_handling),
      rapport: clampInt(metricsRaw.rapport),
      cta_strength: clampInt(metricsRaw.cta_strength),
    },
    overall: clampInt(obj.overall),
    strengths: asStringArray(obj.strengths),
    improvements: asStringArray(obj.improvements),
    suggested_rewrite: typeof obj.suggested_rewrite === "string" ? obj.suggested_rewrite.trim() : "",
    summary: typeof obj.summary === "string" ? obj.summary.trim() : "",
  };
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
    context?: "persona-coach" | "pitch-coach";
    personaName?: string;
  };
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return new Response("messages required", { status: 400 });
  }
  if (!messages.some((m) => m.role === "user")) {
    return new Response("transcript has no rep turns", { status: 400 });
  }

  const assistantLabel =
    body.context === "persona-coach" && body.personaName ? body.personaName : "Coach";
  const contextLine =
    body.context === "persona-coach"
      ? `This was a roleplay call. The rep was speaking with persona "${body.personaName ?? "Prospect"}".`
      : "This was a pitch-critique session — the rep was workshopping a pitch, objection, or lead.";

  const userPrompt = `${contextLine}\n\nTranscript:\n\n${transcriptText(messages, assistantLabel)}`;

  try {
    const result = await generateText({
      model: google("gemma-3-27b-it"),
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
    });
    const card = parseScorecard(result.text);
    if (!card) {
      console.error("[score-session] failed to parse model output:", result.text);
      return new Response("score parse failed", { status: 502 });
    }
    return Response.json(card);
  } catch (err) {
    console.error("[score-session] error:", err);
    return new Response("score generation failed", { status: 500 });
  }
}
