"use client";

import { useState } from "react";
import { useBrowserTts } from "../_lib/useBrowserTts";

type Msg = { role: "user" | "assistant"; content: string };
type Phase = "idle" | "active" | "ended";

const COACH_OPENER =
  "Pitch coach here. Drop the situation in — pitch, objection, or lead profile — and I'll come back with what's working, what's weak, and your next move. What've you got?";

export default function PitchCoachClient() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<Msg[]>([]);
  const [streaming, setStreaming] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tts = useBrowserTts();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading || phase !== "active") return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    const next = [...history, userMsg];
    setHistory(next);
    setInput("");
    setLoading(true);
    setError(null);
    setStreaming("");

    try {
      const res = await fetch("/api/pitch-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setStreaming(acc);
      }
      setHistory((h) => [...h, { role: "assistant", content: acc }]);
      setStreaming("");
      void tts.speak(acc);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  function startSession() {
    const opener: Msg = { role: "assistant", content: COACH_OPENER };
    setHistory([opener]);
    setStreaming("");
    setError(null);
    setPhase("active");
    void tts.speak(COACH_OPENER);
  }

  function endSession() {
    tts.stop();
    setPhase("ended");
  }

  return (
    <div className="pitch-coach__shell">
      <div className="pitch-coach__statusbar" data-testid="pitch-coach-statusbar">
        <span className="pitch-coach__voice" data-testid="pitch-coach-voice">
          {tts.voiceLabel}
        </span>
        <span className="pitch-coach__status">
          {phase === "idle" && "Ready — start a coaching session."}
          {phase === "active" && (tts.isSpeaking ? "Coach speaking…" : "Coach live.")}
          {phase === "ended" && "Session ended."}
        </span>
      </div>

      {phase === "idle" ? (
        <div className="pitch-coach__startbar">
          <p className="pitch-coach__empty">
            Start a session — the coach will open and you can paste the situation.
          </p>
          <button
            type="button"
            className="pitch-coach__start"
            onClick={startSession}
            data-testid="pitch-coach-start"
          >
            ▶ Start session
          </button>
        </div>
      ) : (
        <>
          <div className="pitch-coach__transcript" data-testid="pitch-coach-transcript">
            {history.map((m, i) => (
              <div key={i} className={`pitch-coach__msg pitch-coach__msg--${m.role}`}>
                <span className="pitch-coach__role">{m.role === "user" ? "You" : "Coach"}</span>
                <p>{m.content}</p>
              </div>
            ))}
            {streaming && (
              <div className="pitch-coach__msg pitch-coach__msg--assistant">
                <span className="pitch-coach__role">Coach</span>
                <p>{streaming}</p>
              </div>
            )}
          </div>

          <form className="pitch-coach__form" onSubmit={handleSubmit} data-testid="pitch-coach-form">
            <label htmlFor="pitch-input" className="pitch-coach__label">
              Your context
            </label>
            <textarea
              id="pitch-input"
              className="pitch-coach__input"
              data-testid="pitch-coach-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                phase === "ended"
                  ? "Session ended."
                  : "e.g. 'They said our pricing is too high vs competitor X' or 'Lead is a marketing director at a 50-person SaaS firm'"
              }
              rows={5}
              disabled={loading || phase !== "active"}
            />
            <div className="pitch-coach__actions">
              <button
                type="submit"
                className="pitch-coach__submit"
                data-testid="pitch-coach-submit"
                disabled={loading || !input.trim() || phase !== "active"}
              >
                {loading ? "Coaching…" : "Coach me"}
              </button>
              {phase === "active" && (
                <button
                  type="button"
                  className="pitch-coach__end"
                  onClick={endSession}
                  disabled={loading}
                  data-testid="pitch-coach-end"
                >
                  End session
                </button>
              )}
            </div>
            {error && (
              <p className="pitch-coach__error" data-testid="pitch-coach-error">
                Error: {error}
              </p>
            )}
          </form>
        </>
      )}
    </div>
  );
}
