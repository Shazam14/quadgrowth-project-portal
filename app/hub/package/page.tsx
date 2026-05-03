import { createClient } from "@/lib/supabase/server";
import { upsertPackage } from "./actions";
import "./package-hub.css";

export const metadata = { title: "Package & Account · Hub" };
export const dynamic = "force-dynamic";

type Tier = "starter" | "growth" | "scale";

type ClientRow = { id: string; name: string };

type PackageRow = {
  client_id: string;
  plan_tier: Tier;
  monthly_value: string | number | null;
  billing_contact_name: string | null;
  billing_contact_email: string | null;
  renewal_date: string | null;
  notes: string | null;
  updated_at: string;
};

const TIER_LABEL: Record<Tier, string> = {
  starter: "Starter",
  growth: "Growth",
  scale: "Scale",
};

const dateFmt = new Intl.DateTimeFormat("en-AU", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDateOnly(ymd: string | null): string {
  if (!ymd) return "—";
  const [y, m, d] = ymd.split("-").map(Number);
  return dateFmt.format(new Date(Date.UTC(y, m - 1, d)));
}

function formatMoney(value: string | number | null): string {
  if (value === null || value === undefined) return "—";
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function HubPackagePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
    : { data: null };
  const isAdmin = profile?.role === "admin";

  const [{ data: clientsData }, { data: packagesData }] = await Promise.all([
    supabase.from("clients").select("id, name").order("name"),
    supabase
      .from("client_packages")
      .select(
        "client_id, plan_tier, monthly_value, billing_contact_name, billing_contact_email, renewal_date, notes, updated_at",
      ),
  ]);

  const clients = (clientsData ?? []) as ClientRow[];
  const packages = (packagesData ?? []) as PackageRow[];
  const byClient = new Map(packages.map((p) => [p.client_id, p]));

  return (
    <main className="pkg-hub" data-testid="package-hub-page">
      <p className="pkg-hub__eyebrow">/hub · package &amp; account</p>
      <header className="pkg-hub__header">
        <h1>Package &amp; Account</h1>
        <p>
          {isAdmin
            ? "Set each clinic's plan tier, billing contact, and renewal. Clients see this verbatim on /portal/package."
            : "Read-only view of each assigned clinic's plan, billing, and renewal date. Admin owns edits."}
        </p>
        {!isAdmin ? (
          <p className="pkg-hub__notice" data-testid="package-hub-readonly-notice">
            View-only — only admins can edit package details.
          </p>
        ) : null}
      </header>

      {clients.length === 0 ? (
        <p className="pkg-hub__empty" data-testid="package-hub-empty">
          No clients visible to you yet.
        </p>
      ) : (
        <div className="pkg-hub__list">
          {clients.map((c) => {
            const pkg = byClient.get(c.id) ?? null;
            return (
              <section
                key={c.id}
                className="pkg-hub__row"
                data-testid="package-hub-row"
                data-client-id={c.id}
                data-tier={pkg?.plan_tier ?? "unset"}
              >
                <header className="pkg-hub__row-head">
                  <h2>{c.name}</h2>
                  <span className="pkg-hub__row-tier">
                    {pkg ? TIER_LABEL[pkg.plan_tier] : "No package set"}
                  </span>
                </header>

                {isAdmin ? (
                  <form
                    action={upsertPackage.bind(null, c.id)}
                    className="pkg-hub__form"
                    data-testid="package-hub-form"
                  >
                    <div className="pkg-hub__grid">
                      <label>
                        <span>Plan tier</span>
                        <select
                          name="plan_tier"
                          defaultValue={pkg?.plan_tier ?? "starter"}
                        >
                          <option value="starter">starter</option>
                          <option value="growth">growth</option>
                          <option value="scale">scale</option>
                        </select>
                      </label>
                      <label>
                        <span>Monthly value (AUD)</span>
                        <input
                          type="number"
                          name="monthly_value"
                          step="0.01"
                          min="0"
                          defaultValue={
                            pkg?.monthly_value !== null &&
                            pkg?.monthly_value !== undefined
                              ? String(pkg.monthly_value)
                              : ""
                          }
                          placeholder="e.g. 4500"
                        />
                      </label>
                      <label>
                        <span>Renewal date</span>
                        <input
                          type="date"
                          name="renewal_date"
                          defaultValue={pkg?.renewal_date ?? ""}
                        />
                      </label>
                    </div>

                    <div className="pkg-hub__grid">
                      <label>
                        <span>Billing contact name</span>
                        <input
                          type="text"
                          name="billing_contact_name"
                          maxLength={200}
                          defaultValue={pkg?.billing_contact_name ?? ""}
                          placeholder="e.g. Dr Aisha Patel"
                        />
                      </label>
                      <label>
                        <span>Billing contact email</span>
                        <input
                          type="email"
                          name="billing_contact_email"
                          maxLength={320}
                          defaultValue={pkg?.billing_contact_email ?? ""}
                          placeholder="billing@clinic.com.au"
                        />
                      </label>
                    </div>

                    <label className="pkg-hub__field">
                      <span>Notes (visible to client)</span>
                      <textarea
                        name="notes"
                        rows={3}
                        maxLength={1200}
                        defaultValue={pkg?.notes ?? ""}
                        placeholder="Contract terms, renewal cadence, anything the client should know."
                      />
                    </label>

                    <div className="pkg-hub__actions">
                      <button
                        type="submit"
                        className="pkg-hub__btn"
                        data-testid="package-hub-save"
                      >
                        {pkg ? "Save changes" : "Create package"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <dl
                    className="pkg-hub__readonly"
                    data-testid="package-hub-readonly"
                  >
                    <div>
                      <dt>Monthly</dt>
                      <dd>{formatMoney(pkg?.monthly_value ?? null)}</dd>
                    </div>
                    <div>
                      <dt>Renewal</dt>
                      <dd>{formatDateOnly(pkg?.renewal_date ?? null)}</dd>
                    </div>
                    <div>
                      <dt>Billing</dt>
                      <dd>
                        {pkg?.billing_contact_name ?? "—"}
                        {pkg?.billing_contact_email
                          ? ` · ${pkg.billing_contact_email}`
                          : ""}
                      </dd>
                    </div>
                    {pkg?.notes ? (
                      <div className="pkg-hub__readonly-notes">
                        <dt>Notes</dt>
                        <dd>{pkg.notes}</dd>
                      </div>
                    ) : null}
                  </dl>
                )}
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
