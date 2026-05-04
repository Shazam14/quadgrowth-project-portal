"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./hub-sub-header.css";

export default function HubSubHeader() {
  const pathname = usePathname();
  if (pathname === "/hub") return null;

  return (
    <div className="hub-sub-header" data-testid="hub-sub-header">
      <div className="hub-sub-header__inner">
        <Link href="/hub" className="hub-sub-header__back">
          <span aria-hidden>←</span> Back to Hub
        </Link>
        <span className="hub-sub-header__brand">QuadGrowth · Hub</span>
      </div>
    </div>
  );
}
