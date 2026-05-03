import { createClient } from "@/lib/supabase/server";
import "./package.css";

export const metadata = { title: "Package & Account" };
export const dynamic = "force-dynamic";

type Tier = "starter" | "growth" | "scale";

type PackageRow = {
  plan_tier: Tier;
  monthly_value: string | number | null;
  billing_contact_name: string | null;
  billing_contact_email: string | null;
  renewal_date: string | null; // YYYY-MM-DD
  notes: string | null;
};

const TIER_LABEL: Record<Tier, string> = {
  starter: "Starter",
  growth: "Growth",
  scale: "Scale",
};

const TIER_BLURB: Record<Tier, string> = {
  starter: "Foundation tier — single channel focus, monthly check-ins.",
  growth: "Multi-channel campaigns, weekly cadence, dedicated CGM.",
  scale: "Full-service partnership — cross-clinic strategy + bespoke creative.",
};

const dateFmt = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return dateFmt.format(new Date(Date.UTC(y, m - 1, d)));
}

function formatMoney(value: string | number | null): string | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return null;
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function daysUntil(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  const target = Date.UTC(y, m - 1, d);
  const todayParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (t: string) => Number(todayParts.find((p) => p.type === t)!.value);
  const today = Date.UTC(get("year"), get("month") - 1, get("day"));
  return Math.round((target - today) / 86_400_000);
}

export default async function PackagePage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("client_packages")
    .select(
      "plan_tier, monthly_value, billing_contact_name, billing_contact_email, renewal_date, notes",
    )
    .maybeSingle();

  const pkg = (data ?? null) as PackageRow | null;

  return (
    <main className="pkg" data-testid="package-page">
      <p className="pkg__eyebrow">/portal · package &amp; account</p>
      <header className="pkg__header">
        <h1>Your Package</h1>
        <p>
          Your current plan, billing contact, and renewal date. Reach out to
          your campaign manager to upgrade or change anything below.
        </p>
      </header>

      {error ? (
        <div className="pkg__error" data-testid="package-error">
          Couldn&apos;t load package details. {error.message}
        </div>
      ) : null}

      {!error && !pkg ? (
        <section className="pkg__empty" data-testid="package-empty">
          No package on file yet. Your campaign manager will set this once
          your first month wraps.
        </section>
      ) : null}

      {pkg ? (
        <section
          className={`pkg__card pkg__card--${pkg.plan_tier}`}
          data-testid="package-card"
          data-tier={pkg.plan_tier}
        >
          <div className="pkg__card-head">
            <span
              className={`pkg__tier pkg__tier--${pkg.plan_tier}`}
              data-testid="package-tier"
            >
              {TIER_LABEL[pkg.plan_tier]}
            </span>
            {formatMoney(pkg.monthly_value) ? (
              <span className="pkg__price" data-testid="package-monthly">
                {formatMoney(pkg.monthly_value)}
                <span className="pkg__price-unit">/mo</span>
              </span>
            ) : null}
          </div>
          <p className="pkg__blurb">{TIER_BLURB[pkg.plan_tier]}</p>

          <dl className="pkg__meta">
            {pkg.renewal_date ? (
              <div className="pkg__meta-row">
                <dt>Renewal</dt>
                <dd data-testid="package-renewal">
                  {formatDate(pkg.renewal_date)}
                  <span className="pkg__meta-sub">
                    {(() => {
                      const d = daysUntil(pkg.renewal_date);
                      if (d > 0) return ` · in ${d} day${d === 1 ? "" : "s"}`;
                      if (d === 0) return " · today";
                      return ` · ${Math.abs(d)} day${d === -1 ? "" : "s"} ago`;
                    })()}
                  </span>
                </dd>
              </div>
            ) : null}

            {pkg.billing_contact_name || pkg.billing_contact_email ? (
              <div className="pkg__meta-row">
                <dt>Billing contact</dt>
                <dd data-testid="package-billing">
                  {pkg.billing_contact_name ?? "—"}
                  {pkg.billing_contact_email ? (
                    <span className="pkg__meta-sub">
                      {" · "}
                      <a href={`mailto:${pkg.billing_contact_email}`}>
                        {pkg.billing_contact_email}
                      </a>
                    </span>
                  ) : null}
                </dd>
              </div>
            ) : null}
          </dl>

          {pkg.notes ? (
            <p className="pkg__notes" data-testid="package-notes">
              {pkg.notes}
            </p>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
