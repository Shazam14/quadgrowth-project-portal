import Link from "next/link";
import "./portal.css";

type Feature = {
  label: string;
  href?: string;
  active?: boolean;
};

const FEATURES: Feature[] = [
  { label: "KPI dashboard", href: "/portal/kpis", active: true },
  { label: "Live lead feed", href: "/portal/leads", active: true },
  { label: "Monthly reports", href: "/portal/reports", active: true },
  { label: "Campaign status", href: "/portal/campaigns", active: true },
  { label: "ROI calculator", href: "/portal/roi-calculator", active: true },
  { label: "Next strategy call", href: "/portal/strategy-calls", active: true },
  { label: "Package & account" },
  { label: "Journey timeline" },
];

const SHIPPED = FEATURES.filter((f) => f.active).length;

export const metadata = { title: "Client Portal" };

export default function PortalHome() {
  return (
    <main className="portal" data-testid="portal-hero">
      <div className="portal__logo">
        Quad<span>Growth</span>
      </div>

      <div className="portal__badge" data-testid="portal-badge">
        Phase 1B — In Build
      </div>

      <h1 className="portal__hero">
        Your growth,<br />
        <em>always visible.</em>
      </h1>

      <p className="portal__tagline">
        A live window into your campaigns, leads, bookings, and revenue — built
        specifically for your clinic. No fluff. No vanity metrics. Just results.
      </p>

      <div className="portal__progress-wrap" data-testid="portal-progress">
        <div className="portal__progress-label">
          <span>Build progress</span>
          <span>
            {SHIPPED} of {FEATURES.length}
          </span>
        </div>
        <div className="portal__progress-track">
          <div className="portal__progress-fill" />
        </div>
        <p className="portal__progress-note">
          Shipping the highest-retention features first.
        </p>
      </div>

      <ul className="portal__pills" data-testid="portal-pills">
        {FEATURES.map((f) =>
          f.active && f.href ? (
            <Link
              key={f.label}
              href={f.href}
              className="portal__pill portal__pill--active"
              data-testid="portal-pill"
              data-active="true"
            >
              <span className="portal__pill-dot" />
              {f.label}
              <span className="portal__pill-tag">Live</span>
            </Link>
          ) : (
            <li
              key={f.label}
              className="portal__pill"
              data-testid="portal-pill"
              data-active="false"
            >
              <span className="portal__pill-dot" />
              {f.label}
              <span className="portal__pill-tag">Soon</span>
            </li>
          ),
        )}
      </ul>

      <div className="portal__footer">quadgrowth.com.au · Internal · © 2026</div>
    </main>
  );
}
