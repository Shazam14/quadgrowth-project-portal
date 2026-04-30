import Link from "next/link";
import "./hub.css";

const TOOLS = [
  {
    href: "/hub/flashcards",
    icon: "💬",
    title: "Q&A Flashcards",
    desc: "Discovery, objections, pricing, results, technical — practice the answers.",
  },
  {
    href: "/hub/checklists",
    icon: "✅",
    title: "Operational Checklists",
    desc: "Pre-call prep, onboarding, monthly delivery, weekly lead-gen pipeline.",
  },
  {
    href: "/hub/scripts",
    icon: "📞",
    title: "Lead Gen Scripts",
    desc: "Cold email, follow-ups, cold call openers, discovery framework.",
  },
  {
    href: "/hub/bible",
    icon: "🔐",
    title: "Company Bible",
    desc: "Credentials, team access matrix, security rules. Phase 1 ≤5 people.",
  },
  {
    href: "/hub/branding",
    icon: "🎨",
    title: "Brand Kit",
    desc: "Logo system, colours, typography, social templates, voice & tone.",
  },
  {
    href: "/hub/pitch-coach",
    icon: "🤖",
    title: "AI Pitch Coach",
    desc: "Paste a pitch, objection, or lead. Get a tight critique and your next move.",
  },
  {
    href: "/hub/persona-coach",
    icon: "🎭",
    title: "AI Persona Coach",
    desc: "Live role-play against a tough prospect. Skeptical CFO, defensive director, tyre-kicker.",
  },
  {
    href: "/hub/calls",
    icon: "📞",
    title: "Call History",
    desc: "Every Zadarma outbound call — duration, prospect number, recording playback.",
  },
];

export const metadata = { title: "Sales Hub" };

export default function HubHome() {
  return (
    <main className="hub">
      <p className="hub__eyebrow">/hub</p>
      <header className="hub__header">
        <h1>Sales Hub</h1>
        <p>
          Workspace for Campaign Growth Managers. Pick a tool to begin.
        </p>
      </header>
      <div className="hub__grid">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="hub__card"
            data-testid="hub-tool-card"
          >
            <div className="hub__card-icon" aria-hidden>
              {tool.icon}
            </div>
            <h2>{tool.title}</h2>
            <p>{tool.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
