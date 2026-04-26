import { createClient } from "@/lib/supabase/server";
import "./bible.css";

type EntryRow = {
  id: string;
  category_id: string;
  name: string;
  icon: string | null;
  url: string | null;
  login: string | null;
  notes: string | null;
  sort_order: number;
  bible_credentials: { password: string } | { password: string }[] | null;
};

type AccessLevel = "admin" | "yes" | "no";
type AccessRow = { entry_id: string; person_label: string; level: AccessLevel };

const PEOPLE = ["Jordan", "Member 2", "Member 3", "Member 4", "Member 5"] as const;

const SECURITY_RULES = [
  {
    icon: "🔒",
    title: "Never share passwords via chat or email",
    body: "Hand over verbally or via secure note only. Not Slack, not Gmail, not SMS.",
  },
  {
    icon: "🔄",
    title: "Change passwords when someone leaves",
    body: "Any departure = immediate rotation of all credentials that person had access to.",
  },
  {
    icon: "👁",
    title: "This file is access-gated — keep it that way",
    body: "Do not screenshot or export credentials. The portal login is the only gate right now.",
  },
  {
    icon: "📅",
    title: "Future: 90-day rotation rule",
    body: "When we move to 1Password/Bitwarden (team ≥ 6), all passwords rotate every 90 days with MFA enforced on every account.",
  },
  {
    icon: "🚨",
    title: "Suspected breach? Act immediately",
    body: "Change the affected password first, then notify Jordan. Log the incident date and what was potentially exposed.",
  },
  {
    icon: "📵",
    title: "No shared personal accounts",
    body: "Always use business accounts. Never use a personal Google/Meta/Apple account for company tools.",
  },
];

function getPassword(entry: EntryRow): string | null {
  const cred = entry.bible_credentials;
  if (!cred) return null;
  if (Array.isArray(cred)) return cred[0]?.password ?? null;
  return cred.password ?? null;
}

function accessLabel(level: AccessLevel | undefined): string {
  if (level === "admin") return "✦ Admin";
  if (level === "yes") return "✓ Yes";
  return "—";
}

export default async function BiblePage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("bible_categories")
    .select("id, label, sort_order")
    .order("sort_order");

  const { data: entries } = await supabase
    .from("bible_entries")
    .select(
      "id, category_id, name, icon, url, login, notes, sort_order, bible_credentials(password)",
    )
    .order("category_id")
    .order("sort_order")
    .returns<EntryRow[]>();

  const { data: access } = await supabase
    .from("bible_access")
    .select("entry_id, person_label, level")
    .returns<AccessRow[]>();

  const accessMap = new Map<string, Map<string, AccessLevel>>();
  for (const row of access ?? []) {
    if (!accessMap.has(row.entry_id)) accessMap.set(row.entry_id, new Map());
    accessMap.get(row.entry_id)!.set(row.person_label, row.level);
  }

  const grouped = (categories ?? []).map((cat) => ({
    ...cat,
    entries: (entries ?? []).filter((e) => e.category_id === cat.id),
  }));
  const allEntries = entries ?? [];

  return (
    <main className="bible">
      <header className="bible__header">
        <h1>🔐 Company Bible</h1>
        <p className="bible__subtitle">
          Source of truth for credentials, tools, and team access. Treat as
          confidential — do not share externally.
        </p>
      </header>

      <aside className="bible__phase-banner">
        <strong>⚠️ Phase 1 — Small Team Protocol (≤5 people)</strong>
        <p>
          Credentials are stored here for operational simplicity while the team
          is small. As we grow, we will migrate to a dedicated password manager
          (1Password / Bitwarden) with role-based vaults, enforced 90-day
          rotation, and MFA on all accounts. This document will then become a
          reference index only — not the vault itself.
        </p>
      </aside>

      {grouped.map((cat) => (
        <section key={cat.id} className="bible__category">
          <h2>{cat.label}</h2>
          <div className="bible__grid">
            {cat.entries.map((entry) => {
              const password = getPassword(entry);
              return (
                <article
                  key={entry.id}
                  className="bible__card"
                  data-testid="bible-entry"
                >
                  <h3>
                    <span aria-hidden>{entry.icon}</span> {entry.name}
                  </h3>
                  {entry.url && (
                    <p className="bible__field">
                      <span className="bible__label">URL</span>
                      <span className="bible__value">{entry.url}</span>
                    </p>
                  )}
                  {entry.login && (
                    <p className="bible__field">
                      <span className="bible__label">Login</span>
                      <span className="bible__value">{entry.login}</span>
                    </p>
                  )}
                  <p className="bible__field">
                    <span className="bible__label">Password</span>
                    {password ? (
                      <span className="bible__password">{password}</span>
                    ) : (
                      <span className="bible__redacted">🔒 Admin only</span>
                    )}
                  </p>
                  {entry.notes && (
                    <p className="bible__notes">{entry.notes}</p>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      ))}

      <section className="bible__matrix-section">
        <h2>Team Access Matrix</h2>
        <p className="bible__subtitle">
          Who has access to what. Update as the team grows.
        </p>
        <div className="bible__matrix-wrap">
          <table
            className="bible__matrix"
            data-testid="bible-access-matrix"
          >
            <thead>
              <tr>
                <th>Tool</th>
                {PEOPLE.map((p) => (
                  <th key={p}>{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allEntries.map((entry) => {
                const row = accessMap.get(entry.id);
                return (
                  <tr key={entry.id}>
                    <td className="bible__matrix-tool">{entry.name}</td>
                    {PEOPLE.map((p) => {
                      const level = row?.get(p) ?? "no";
                      return (
                        <td
                          key={p}
                          data-access={level}
                          className={`bible__matrix-cell bible__matrix-cell--${level}`}
                        >
                          {accessLabel(level)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bible__rules-section">
        <h2>Security Rules</h2>
        <div className="bible__rules-grid">
          {SECURITY_RULES.map((rule) => (
            <article
              key={rule.title}
              className="bible__rule"
              data-testid="security-rule"
            >
              <h3>
                <span aria-hidden>{rule.icon}</span> {rule.title}
              </h3>
              <p>{rule.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
