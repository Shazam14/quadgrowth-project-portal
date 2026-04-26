"use client";

import { useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function PitchCoachClient() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<Msg[]>([]);
  const [streaming, setStreaming] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
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
      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setStreaming(accumulated);
      }
      setHistory((h) => [...h, { role: "assistant", content: accumulated }]);
      setStreaming("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setHistory([]);
    setStreaming("");
    setError(null);
  }

  return (
    <div className="pitch-coach__shell">
      {history.length > 0 && (
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
      )}

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
          placeholder="e.g. 'They said our pricing is too high vs competitor X' or 'Lead is a marketing director at a 50-person SaaS firm'"
          rows={5}
          disabled={loading}
        />
        <div className="pitch-coach__actions">
          <button
            type="submit"
            className="pitch-coach__submit"
            data-testid="pitch-coach-submit"
            disabled={loading || !input.trim()}
          >
            {loading ? "Coaching…" : "Coach me"}
          </button>
          {history.length > 0 && (
            <button
              type="button"
              className="pitch-coach__reset"
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </button>
          )}
        </div>
        {error && (
          <p className="pitch-coach__error" data-testid="pitch-coach-error">
            Error: {error}
          </p>
        )}
      </form>
    </div>
  );
}
