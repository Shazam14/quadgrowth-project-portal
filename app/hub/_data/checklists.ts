export type ChecklistTag = "critical" | "important" | "nice";

export type ChecklistItem = {
  title: string;
  sub: string;
  tag: ChecklistTag;
};

export type ChecklistGroup = {
  group: string;
  items: ChecklistItem[];
};

export const CHECKLIST_DATA: ChecklistGroup[] = [
  {
    group: "🔍 Before the Discovery Call",
    items: [
      { title: "Research the clinic online", sub: "Google their name, check their website, count their reviews, see their rating", tag: "critical" },
      { title: "Check Meta Ad Library", sub: "Search clinic name at facebook.com/ads/library — are they running ads?", tag: "critical" },
      { title: "Google 'dentist [suburb]'", sub: "See where they rank — do they appear? Are competitors above them?", tag: "critical" },
      { title: "Note 2–3 specific gaps", sub: "Low reviews, no ads, outdated site, no booking widget — use these in the call", tag: "important" },
      { title: "Prepare your intro (30 seconds)", sub: "Who you are, what QuadGrowth does, why you're calling them specifically", tag: "important" },
      { title: "Have your Calendly link ready", sub: "For follow-up booking if they're interested", tag: "nice" },
    ],
  },
  {
    group: "📞 During the Discovery Call",
    items: [
      { title: "Ask about their current patient capacity", sub: "Are you generally full? How many empty slots per week on average?", tag: "critical" },
      { title: "Ask what's working and what isn't", sub: "Don't pitch until you understand their situation", tag: "critical" },
      { title: "Reference their specific gap", sub: "Use what you found in your research — makes the call feel personal", tag: "critical" },
      { title: "Listen more than you talk", sub: "Aim for 60/40 — 60% them talking, 40% you", tag: "important" },
      { title: "Confirm decision maker", sub: "Is the person you're speaking to the one who approves marketing spend?", tag: "important" },
      { title: "Set a clear next step before hanging up", sub: "Either a follow-up call, a proposal, or a confirmed start date", tag: "critical" },
    ],
  },
  {
    group: "📋 First Client Onboarding",
    items: [
      { title: "Send and confirm signed contract", sub: "Use DocuSign or equivalent — don't start work without a signed agreement", tag: "critical" },
      { title: "Confirm first payment received", sub: "First month's fee must be received before any work begins", tag: "critical" },
      { title: "Get access to Google Business Profile", sub: "Request Manager access — not Ownership", tag: "critical" },
      { title: "Complete onboarding questionnaire", sub: "Clinic name, services offered, target demographics, unique selling points", tag: "critical" },
      { title: "Set up client Airtable CRM record", sub: "Log all contact details, contract value, start date, renewal date", tag: "important" },
      { title: "Schedule kickoff call", sub: "30 minutes to align on goals, expectations, and communication cadence", tag: "important" },
      { title: "Set up reporting dashboard", sub: "Client should have access to live campaign metrics from Day 1", tag: "important" },
      { title: "Add client to Slack channel or comms thread", sub: "Agree on preferred communication method", tag: "nice" },
    ],
  },
  {
    group: "📅 Monthly Delivery Checklist",
    items: [
      { title: "Review campaign performance vs last month", sub: "Leads, bookings, CPL (cost per lead), and revenue generated", tag: "critical" },
      { title: "Optimise top campaigns — pause underperformers", sub: "Reallocate budget based on what's working", tag: "critical" },
      { title: "Send monthly report to client", sub: "Keep it simple: 3 wins, 1 challenge, next month's focus", tag: "critical" },
      { title: "Hold monthly strategy call", sub: "30 minutes max — clients don't want long calls", tag: "important" },
      { title: "Confirm invoice sent and payment received", sub: "Chase immediately if overdue — don't let it slide", tag: "critical" },
      { title: "Check Google Business Profile for new reviews", sub: "Flag any negative reviews to the client immediately", tag: "important" },
      { title: "Update Airtable with this month's metrics", sub: "Keep a running history — useful for retention and upsells", tag: "nice" },
    ],
  },
  {
    group: "🚀 Lead Gen Pipeline (Weekly)",
    items: [
      { title: "Run Outscraper pull for new clinics", sub: "Rotate suburbs — don't oversaturate the same area", tag: "important" },
      { title: "Check n8n workflow ran successfully", sub: "Verify no errors in last 7 days of executions", tag: "critical" },
      { title: "Review HOT leads in Airtable", sub: "Any with score 8+ that haven't been contacted yet?", tag: "critical" },
      { title: "Check Instantly.ai campaign stats", sub: "Open rate, reply rate, bounce rate — flag anything unusual", tag: "important" },
      { title: "Reply to any positive email responses within 24hrs", sub: "Speed of response is everything — book the call fast", tag: "critical" },
      { title: "Update lead statuses in Airtable", sub: "Move leads through: New → Contacted → Replied → Call Booked → Closed", tag: "important" },
    ],
  },
];
