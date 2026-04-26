import Link from "next/link";
import "./portal.css";

const TOOLS = [
  {
    href: "/portal/roi-calculator",
    icon: "📈",
    title: "ROI Calculator",
    desc: "Patient lifetime value × confirmed bookings — see what this campaign is really worth.",
  },
];

export const metadata = { title: "Client Portal" };

export default function PortalHome() {
  return (
    <main className="portal">
      <p className="portal__eyebrow">/portal</p>
      <header className="portal__header">
        <h1>Client Portal</h1>
        <p>
          Your QuadGrowth dashboard. Track campaign performance, ROI, and live lead activity.
        </p>
      </header>
      <div className="portal__grid" data-testid="portal-grid">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="portal__card"
            data-testid="portal-tool-card"
          >
            <div className="portal__card-icon" aria-hidden>
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
