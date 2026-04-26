export const metadata = {
  title: "Client Portal",
};

export default function PortalHome() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 520 }}>
        <p
          style={{
            fontFamily: "var(--font-dm-mono), monospace",
            fontSize: 11,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "var(--gold)",
            marginBottom: 12,
          }}
        >
          /portal
        </p>
        <h1
          style={{
            fontFamily: "var(--font-playfair), serif",
            fontSize: 42,
            color: "var(--cream)",
            marginBottom: 16,
            fontWeight: 600,
          }}
        >
          Client Portal
        </h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
          Read-only dashboard for QuadGrowth clients — KPI summary, live lead feed,
          ROI calculator. Auth gate arrives Day 2 (Supabase). Phase 1B features
          arrive Week 2.
        </p>
        <p style={{ marginTop: 32 }}>
          <a href="/" style={{ color: "var(--gold)" }}>
            ← Back to roadmap
          </a>
        </p>
      </div>
    </main>
  );
}
