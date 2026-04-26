"use client";

import { useState } from "react";

type PersonaSummary = { id: string; label: string; blurb: string };
type Msg = { role: "user" | "assistant"; content: string };

export default function PersonaCoachClient({ personas }: { personas: PersonaSummary[] }) {
  const [personaId, setPersonaId] = useState(personas[0]?.id ?? "");
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<Msg[]>([]);
  const [streaming, setStreaming] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activePersona = personas.find((p) => p.id === personaId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading || !personaId) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    const next = [...history, userMsg];
    setHistory(next);
    setInput("");
    setLoading(true);
    setError(null);
    setStreaming("");

    try {
      const res = await fetch("/api/persona-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaId, messages: next }),
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
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  function handlePersonaChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setPersonaId(e.target.value);
    setHistory([]);
    setStreaming("");
    setError(null);
  }

  function handleReset() {
    setHistory([]);
    setStreaming("");
    setError(null);
  }

  return (
    <div className="persona-coach__shell">
      <div className="persona-coach__picker">
        <label htmlFor="persona-select" className="persona-coach__label">
          Persona
        </label>
        <select
          id="persona-select"
          className="persona-coach__select"
          data-testid="persona-coach-select"
          value={personaId}
          onChange={handlePersonaChange}
          disabled={loading}
        >
          {personas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        {activePersona && (
          <p className="persona-coach__blurb" data-testid="persona-coach-blurb">
            {activePersona.blurb}
          </p>
        )}
      </div>

      {history.length > 0 && (
        <div className="persona-coach__transcript" data-testid="persona-coach-transcript">
          {history.map((m, i) => (
            <div key={i} className={`persona-coach__msg persona-coach__msg--${m.role}`}>
              <span className="persona-coach__role">
                {m.role === "user" ? "You" : activePersona?.label ?? "Prospect"}
              </span>
              <p>{m.content}</p>
            </div>
          ))}
          {streaming && (
            <div className="persona-coach__msg persona-coach__msg--assistant">
              <span className="persona-coach__role">{activePersona?.label ?? "Prospect"}</span>
              <p>{streaming}</p>
            </div>
          )}
        </div>
      )}

      <form className="persona-coach__form" onSubmit={handleSubmit} data-testid="persona-coach-form">
        <label htmlFor="persona-input" className="persona-coach__label">
          Your line
        </label>
        <textarea
          id="persona-input"
          className="persona-coach__input"
          data-testid="persona-coach-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            history.length === 0
              ? "Open the call. e.g. 'Hi Alex, thanks for taking the time. Mind if I share why I reached out?'"
              : "Your reply…"
          }
          rows={3}
          disabled={loading}
        />
        <div className="persona-coach__actions">
          <button
            type="submit"
            className="persona-coach__submit"
            data-testid="persona-coach-submit"
            disabled={loading || !input.trim() || !personaId}
          >
            {loading ? "…" : history.length === 0 ? "Start call" : "Send"}
          </button>
          {history.length > 0 && (
            <button
              type="button"
              className="persona-coach__reset"
              onClick={handleReset}
              disabled={loading}
            >
              End call
            </button>
          )}
        </div>
        {error && (
          <p className="persona-coach__error" data-testid="persona-coach-error">
            Error: {error}
          </p>
        )}
      </form>
    </div>
  );
}
