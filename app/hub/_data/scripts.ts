export type ScriptStep = {
  label: string;
  text: string;
  note: string;
};

export type Script = {
  icon: string;
  title: string;
  desc: string;
  steps: ScriptStep[];
};

export const SCRIPTS_DATA: Script[] = [
  {
    icon: "📧",
    title: "Cold Email — First Touch",
    desc: "Personalised first email to a dental clinic with identified digital gap",
    steps: [
      {
        label: "Subject Line",
        text: "[Clinic Name] — patients in [Suburb] are searching, but not finding you",
        note: "<strong>Tip:</strong> Use their actual clinic name and suburb. Avoid 'Quick question' or 'Following up' — too generic.",
      },
      {
        label: "Opening",
        text: "Hi [First Name],\n\nI came across [Clinic Name] while researching dental clinics in [Suburb] and noticed something worth flagging.",
        note: "<strong>Tip:</strong> Never open with 'I hope this email finds you well.' Get straight to the point.",
      },
      {
        label: "The Gap (personalised)",
        text: "When someone searches 'dentist in [Suburb]' right now, your competitors [Competitor 1] and [Competitor 2] appear in the top results — but [Clinic Name] doesn't. That gap means you're invisible to new patients who are actively looking.",
        note: "<strong>Tip:</strong> This gap comes from your pre-call research. The more specific you are, the better the reply rate.",
      },
      {
        label: "The Offer",
        text: "We've helped dental clinics across Melbourne go from 60% to 95% appointment capacity in 6 weeks using AI-driven local search and targeted patient campaigns. I'd love to show you what's possible for [Clinic Name] in a quick 20-minute call.",
        note: "<strong>Tip:</strong> One specific result is more convincing than a list of features.",
      },
      {
        label: "CTA & Sign-off",
        text: "Would Thursday or Friday this week work for you?\n\nJordan\nManaging Director, QuadGrowth\nquadgrowth.com.au\n\nTo unsubscribe from further emails, simply reply with 'unsubscribe'.",
        note: "<strong>Spam Act:</strong> The unsubscribe line is legally required for commercial emails in Australia.",
      },
    ],
  },
  {
    icon: "🔁",
    title: "Follow-Up Email — Day 4",
    desc: "If no reply to first email, send this short follow-up",
    steps: [
      {
        label: "Subject Line",
        text: "Re: [Clinic Name] — just checking in",
        note: "<strong>Tip:</strong> Reply to the original thread so it appears as a continuation.",
      },
      {
        label: "Body",
        text: "Hi [First Name],\n\nJust wanted to bump this up in case it got buried.\n\nI noticed [specific gap — e.g. you have 18 Google reviews while the average Melbourne clinic your size has 60+]. That's a quick win we could address in the first 30 days.\n\nIf now isn't the right time, totally fine — just let me know and I won't follow up again. But if you do have 20 minutes this week, I think you'd find it valuable.\n\nJordan\nQuadGrowth",
        note: "<strong>Tip:</strong> Short, low-pressure follow-ups outperform long ones. Give them an easy out — it actually increases replies.",
      },
    ],
  },
  {
    icon: "🔁",
    title: "Follow-Up Email — Day 10",
    desc: "Final follow-up — low pressure, leaves the door open",
    steps: [
      {
        label: "Subject Line",
        text: "Last note from me — [Clinic Name]",
        note: "<strong>Tip:</strong> 'Last note' emails often get the highest reply rates because people feel the urgency.",
      },
      {
        label: "Body",
        text: "Hi [First Name],\n\nI'll keep this brief — this is my last follow-up.\n\nIf growing your patient numbers isn't a priority right now, no worries at all. If it ever becomes one, feel free to reach out.\n\nOne last thought: if you Google 'dentist [suburb]' today, you'll see exactly what your potential patients see. Worth a look.\n\nAll the best,\nJordan\nQuadGrowth — quadgrowth.com.au",
        note: "<strong>Tip:</strong> The Google challenge at the end plants a seed even if they don't reply now.",
      },
    ],
  },
  {
    icon: "📞",
    title: "Cold Call Opening Script",
    desc: "For calling clinic reception to reach the practice owner or principal dentist",
    steps: [
      {
        label: "Getting Past Reception",
        text: "Hi there, my name is Jordan — I'm calling from QuadGrowth. I've been researching dental clinics in [suburb] and I wanted to briefly speak with [Dr. Name / the practice owner] about something I found on their Google profile. Is he/she available for just two minutes?",
        note: "<strong>Tip:</strong> Mention something specific ('their Google profile') — it sounds more purposeful than 'I'd like to discuss marketing'.",
      },
      {
        label: "When You Reach the Owner",
        text: "Hi Dr. [Name], thanks for taking my call. My name is Jordan from QuadGrowth. I'll be quick — I was looking at dental clinics in [suburb] and noticed that when patients search 'dentist in [suburb]', your clinic isn't appearing in the top results, even though you've been established there for [X years]. I've helped clinics in similar situations go from invisible to fully booked within 6 weeks. Would you have 20 minutes this week to see if we can do the same for [Clinic Name]?",
        note: "<strong>Tip:</strong> Respect their time — be fast, specific, and let them say yes or no quickly.",
      },
      {
        label: "If They Say 'We're not interested'",
        text: "Totally understand — I appreciate you being straight with me. Can I ask — is it the timing, or is it something about the approach that doesn't fit? I'm always looking to improve how I reach out.",
        note: "<strong>Tip:</strong> This is genuine curiosity, not manipulation. Sometimes they'll open up and give you useful intel — or change their mind.",
      },
      {
        label: "If They Say 'Send me something by email'",
        text: "Absolutely. What's the best email to send it to? And just so I send you the right information — is new patient growth the main priority right now, or is there something else more pressing?",
        note: "<strong>Tip:</strong> Always qualify before sending — it helps you personalise the follow-up email and shows you listened.",
      },
    ],
  },
  {
    icon: "🤝",
    title: "Discovery Call Framework",
    desc: "Structure for your first proper conversation with a warm or interested lead",
    steps: [
      {
        label: "Open (2 min)",
        text: "Thanks so much for making time, Dr. [Name]. I've done a bit of research on [Clinic Name] beforehand so I'm not going in blind — I know you're in [suburb] and you've been open [X years]. I'd love to spend the first half of this call understanding your situation, and the second half showing you what we might be able to do. Does that work?",
        note: "<strong>Tip:</strong> Always confirm the agenda upfront. It shows professionalism and sets expectations.",
      },
      {
        label: "Diagnose (10 min — ask these questions)",
        text: "1. How full is your appointment book on a typical week?\n2. Where do most of your current patients come from?\n3. What marketing have you tried before, and what happened?\n4. If you could wave a wand, what does growth look like for you in the next 12 months?\n5. What's your biggest frustration with getting new patients right now?",
        note: "<strong>Tip:</strong> Don't rush this section. The more you understand their situation, the better your pitch will land.",
      },
      {
        label: "Present (8 min)",
        text: "Based on what you've told me, here's what I'd focus on for [Clinic Name] specifically... [Reference their gap]. We'd start with [specific first action], then [second action]. Most clinics see the first results within 2–3 weeks.\n\nWould it be helpful if I put together a quick proposal specific to your situation?",
        note: "<strong>Tip:</strong> Only present solutions relevant to what they told you. Generic pitches lose deals.",
      },
      {
        label: "Close / Next Step (3 min)",
        text: "So where does this land for you? If it feels like a fit, I can have a proposal to you by [day]. If you need more time, no pressure — what would help you make a decision?",
        note: "<strong>Tip:</strong> Always close on a specific next step. 'I'll be in touch' is not a next step.",
      },
    ],
  },
  {
    icon: "💌",
    title: "Proposal Follow-Up Email",
    desc: "After sending a proposal — following up if no response after 48 hours",
    steps: [
      {
        label: "Subject Line",
        text: "QuadGrowth proposal for [Clinic Name] — any questions?",
        note: "",
      },
      {
        label: "Body",
        text: "Hi Dr. [Name],\n\nJust wanted to check you received the proposal I sent through. Happy to jump on a 10-minute call to walk you through it or answer any questions — sometimes it's easier than reading a document.\n\nI've also set aside a tentative start date of [Date] in case you'd like to move quickly, but there's no pressure.\n\nLet me know either way — I appreciate you considering us.\n\nJordan\nQuadGrowth",
        note: "<strong>Tip:</strong> Mentioning a tentative start date creates subtle urgency without being pushy.",
      },
    ],
  },
];
