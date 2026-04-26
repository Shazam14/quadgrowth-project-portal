export type ScenarioId = "cold-email-reply" | "discovery" | "objection" | "warm-lead";

export type Scenario = {
  id: ScenarioId;
  label: string;
  opener: string;
  promptHint: string;
};

export const SCENARIOS: Scenario[] = [
  {
    id: "cold-email-reply",
    label: "Cold email reply",
    opener:
      "Pitch coach here. Lead just replied to your cold email — paste their reply and your draft response, I'll sharpen it.",
    promptHint:
      "The CGM is replying to a lead who responded to a cold email. Help them craft a tight follow-up that books the meeting without sounding desperate.",
  },
  {
    id: "discovery",
    label: "Discovery call",
    opener:
      "Pitch coach here. Discovery call coming up — share the lead profile and we'll plan your opener and three discovery questions.",
    promptHint:
      "The CGM is preparing for an early-stage discovery call. Help them with openers and three sharp discovery questions tailored to the prospect.",
  },
  {
    id: "objection",
    label: "Objection handling",
    opener:
      "Pitch coach here. Hit me with the objection — what did they push back on and what's your current response?",
    promptHint:
      "The CGM is handling a live objection. Help them reframe the objection and give 1-2 concise sample responses.",
  },
  {
    id: "warm-lead",
    label: "Warm lead followup",
    opener:
      "Pitch coach here. Re-engaging a warm lead — share the history and what you want from this touch, I'll shape the message.",
    promptHint:
      "The CGM is re-engaging a previously-interested warm lead. Help them craft a follow-up that revives interest without feeling pushy.",
  },
];

export const SUBURBS: string[] = [
  "Sydney NSW",
  "Melbourne VIC",
  "Brisbane QLD",
  "Perth WA",
  "Adelaide SA",
  "Gold Coast QLD",
  "Newcastle NSW",
  "Canberra ACT",
  "Hobart TAS",
  "Sunshine Coast QLD",
];

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
