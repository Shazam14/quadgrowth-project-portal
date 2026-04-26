export const metadata = {
  title: "Admin",
};

export default function AdminHome() {
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
          /admin · jordan
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
          Admin
        </h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
          Internal admin tools — client management, CGM↔client assignments, full
          Bible CRUD, audit logs. Admin role only (Jordan + you). Supabase RLS
          enforces access Day 2.
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
