import { createClient } from "@/lib/supabase/server";
import "./campaigns.css";

export const metadata = { title: "Campaign Status" };
export const dynamic = "force-dynamic";

type Channel = "google_ads" | "meta_ads" | "gbp" | "landing_page";
type Status = "live" | "paused" | "setup";

type CampaignRow = {
  id: string;
  channel: Channel;
  status: Status;
  notes: string | null;
  started_at: string | null;
};

const CHANNEL_LABEL: Record<Channel, string> = {
  google_ads: "Google Ads",
  meta_ads: "Meta Ads",
  gbp: "Google Business Profile",
  landing_page: "Landing Page",
};

const CHANNEL_ICON: Record<Channel, string> = {
  google_ads: "🔍",
  meta_ads: "📱",
  gbp: "📍",
  landing_page: "🌐",
};

const CHANNEL_ORDER: Channel[] = ["google_ads", "meta_ads", "gbp", "landing_page"];

const STATUS_LABEL: Record<Status, string> = {
  live: "Live",
  paused: "Paused",
  setup: "In Setup",
};

const dateFmt = new Intl.DateTimeFormat("en-AU", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return dateFmt.format(new Date(iso));
}

export default async function CampaignsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select("id, channel, status, notes, started_at");

  const rows = (data ?? []) as CampaignRow[];
  const byChannel = new Map(rows.map((r) => [r.channel, r]));
  const ordered = CHANNEL_ORDER.map((c) => byChannel.get(c)).filter(
    (r): r is CampaignRow => Boolean(r),
  );

  return (
    <main className="campaigns" data-testid="campaigns-page">
      <p className="campaigns__eyebrow">/portal · campaign status</p>
      <header className="campaigns__header">
        <h1>Campaign Status</h1>
        <p>
          Live status of every channel running for your clinic. Updated by your
          campaign manager — nothing here happens silently.
        </p>
      </header>

      {error ? (
        <div className="campaigns__error" data-testid="campaigns-error">
          Couldn&apos;t load campaigns. {error.message}
        </div>
      ) : ordered.length === 0 ? (
        <div className="campaigns__empty" data-testid="campaigns-empty">
          No campaigns configured yet. Your campaign manager will add channels
          here as they go live.
        </div>
      ) : (
        <div className="campaigns__grid" data-testid="campaigns-grid">
          {ordered.map((c) => (
            <article
              key={c.id}
              className="campaigns__card"
              data-testid="campaigns-card"
              data-channel={c.channel}
              data-status={c.status}
            >
              <div className="campaigns__card-head">
                <span className="campaigns__icon" aria-hidden>
                  {CHANNEL_ICON[c.channel]}
                </span>
                <h2>{CHANNEL_LABEL[c.channel]}</h2>
                <span
                  className={`campaigns__pill campaigns__pill--${c.status}`}
                  data-testid="campaigns-status"
                >
                  {STATUS_LABEL[c.status]}
                </span>
              </div>
              {c.notes ? <p className="campaigns__notes">{c.notes}</p> : null}
              <p className="campaigns__started">
                <span>Started</span>
                <span>{formatDate(c.started_at)}</span>
              </p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
