import Link from "next/link";

export const metadata = {
  title: "QuadGrowth",
  description: "QuadGrowth internal portal.",
};

export default function Home() {
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
      <div style={{ maxWidth: 480 }}>
        <p
          style={{
            fontFamily: "var(--font-dm-mono), ui-monospace, monospace",
            fontSize: 11,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "var(--gold)",
            marginBottom: 12,
          }}
        >
          QuadGrowth
        </p>
        <h1
          style={{
            fontFamily: "var(--font-playfair), serif",
            fontSize: 44,
            color: "var(--cream)",
            marginBottom: 16,
            fontWeight: 600,
          }}
        >
          Internal Portal
        </h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.6, marginBottom: 32 }}>
          Sign in to access your workspace.
        </p>
        <Link
          href="/login"
          style={{
            display: "inline-block",
            background: "var(--gold)",
            color: "var(--navy-dark)",
            padding: "12px 28px",
            borderRadius: 8,
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: 0.4,
          }}
        >
          Sign in →
        </Link>
      </div>
    </main>
  );
}
