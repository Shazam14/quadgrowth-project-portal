export const metadata = {
  title: "Sales Hub",
};

export default function HubHome() {
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
          /hub
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
          Sales Hub
        </h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
          Workspace for Campaign Growth Managers — Q&amp;A, scripts, Mistral pitch
          coach, Voxtral transcripts, Zadarma call history, and the Company Bible.
          Migration from `quadgrowth-lead/` lands Day 2–3. CGMs sign up next week.
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
