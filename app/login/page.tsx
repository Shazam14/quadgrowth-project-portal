"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setError(error.message);
    } else {
      setStatus("sent");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <div style={{ maxWidth: 420, width: "100%" }}>
        <p
          style={{
            fontFamily: "var(--font-dm-mono), monospace",
            fontSize: 11,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "var(--gold)",
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          /login
        </p>
        <h1
          style={{
            fontFamily: "var(--font-playfair), serif",
            fontSize: 36,
            color: "var(--cream)",
            marginBottom: 8,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          Sign in
        </h1>
        <p
          style={{
            color: "var(--muted)",
            lineHeight: 1.6,
            textAlign: "center",
            marginBottom: 32,
            fontSize: 14,
          }}
        >
          Enter your email — we&apos;ll send you a magic link.
        </p>

        {status === "sent" ? (
          <div
            style={{
              border: "1px solid var(--gold)",
              borderRadius: 8,
              padding: 24,
              textAlign: "center",
              color: "var(--cream)",
            }}
          >
            <p style={{ marginBottom: 8, fontWeight: 600 }}>Check your inbox</p>
            <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6 }}>
              We sent a sign-in link to <strong>{email}</strong>. Click it to
              continue.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              style={{
                padding: "14px 16px",
                fontSize: 15,
                fontFamily: "var(--font-dm-sans), sans-serif",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 8,
                color: "var(--cream)",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={status === "sending"}
              style={{
                padding: "14px 16px",
                fontSize: 14,
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontWeight: 600,
                background: "var(--gold)",
                color: "var(--navy-dark)",
                border: "none",
                borderRadius: 8,
                cursor: status === "sending" ? "wait" : "pointer",
                opacity: status === "sending" ? 0.7 : 1,
              }}
            >
              {status === "sending" ? "Sending…" : "Send magic link"}
            </button>
            {error ? (
              <p
                style={{
                  color: "#ff6b6b",
                  fontSize: 13,
                  marginTop: 4,
                  textAlign: "center",
                }}
              >
                {error}
              </p>
            ) : null}
          </form>
        )}

        <p style={{ marginTop: 32, textAlign: "center" }}>
          <a
            href="/"
            style={{
              color: "var(--gold)",
              fontSize: 13,
              fontFamily: "var(--font-dm-sans), sans-serif",
            }}
          >
            ← Back to roadmap
          </a>
        </p>
      </div>
    </main>
  );
}
