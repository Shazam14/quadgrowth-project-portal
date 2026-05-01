import Link from "next/link";
import "./admin.css";

const TOOLS = [
  {
    href: "/hub",
    icon: "🏠",
    title: "Sales Hub",
    desc: "CGM workspace — calls, leads, pitch coach, flashcards, and brand kit.",
  },
  {
    href: "/portal",
    icon: "📊",
    title: "Client Portal",
    desc: "Client-facing dashboard — ROI calculator, live lead feed, and KPIs.",
  },
  {
    href: "/admin/team",
    icon: "👥",
    title: "Team",
    desc: "View all users and assign roles — CGM, client, or admin.",
  },
  {
    href: "/roadmap",
    icon: "🗺️",
    title: "Build Roadmap",
    desc: "Phase 1/2/3 plan for the QuadGrowth platform.",
  },
  {
    href: "/admin/bible",
    icon: "🔐",
    title: "Credentials & Tools",
    desc: "Manage logins, tools, and access across the business.",
  },
];

export const metadata = { title: "Admin" };

export default function AdminHome() {
  return (
    <main className="admin">
      <p className="admin__eyebrow">/admin</p>
      <header className="admin__header">
        <h1>Admin</h1>
        <p>
          Internal tools for QuadGrowth ops. Manage clients, CGM↔client assignments,
          and the company Bible. Admin role only.
        </p>
      </header>
      <div className="admin__grid" data-testid="admin-grid">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="admin__card"
            data-testid="admin-tool-card"
          >
            <div className="admin__card-icon" aria-hidden>
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
