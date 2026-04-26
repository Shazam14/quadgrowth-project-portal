import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "QuadGrowth",
  description: "QuadGrowth internal portal.",
};

const ROLE_HOME: Record<string, string> = {
  client: "/portal",
  cgm: "/hub",
  admin: "/admin",
};

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const home = profile?.role ? ROLE_HOME[profile.role] : null;
    if (home) redirect(home);
  }

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
