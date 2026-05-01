"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./hub-nav.css";

const LINKS = [
  { href: "/hub", label: "Hub" },
  { href: "/hub/flashcards", label: "Flashcards" },
  { href: "/hub/checklists", label: "Checklists" },
  { href: "/hub/scripts", label: "Scripts" },
  { href: "/hub/bible", label: "Bible" },
  { href: "/hub/branding", label: "Brand Kit" },
  { href: "/hub/calls", label: "Calls" },
  { href: "/portal", label: "Client Portal" },
  { href: "/roadmap", label: "Roadmap" },
];

export default function HubNav() {
  const pathname = usePathname();

  return (
    <nav className="hub-nav" data-testid="hub-nav" aria-label="Sales hub navigation">
      <div className="hub-nav__inner">
        <span className="hub-nav__brand">QuadGrowth · Hub</span>
        <ul className="hub-nav__links">
          {LINKS.map((link) => {
            const active =
              link.href === "/hub"
                ? pathname === "/hub"
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`hub-nav__link${active ? " hub-nav__link--active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
