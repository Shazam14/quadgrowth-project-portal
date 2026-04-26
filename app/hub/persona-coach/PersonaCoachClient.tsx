"use client";

import { useState } from "react";
import type { Difficulty } from "./_data/personas";

type PersonaSummary = {
  id: string;
  difficulty: Difficulty;
  initials: string;
  name: string;
  role: string;
  context: string[];
  traits: string[];
  blurb: string;
  objections: string[];
  goal: string;
};

type Msg = { role: "user" | "assistant"; content: string };

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  hardest: "Hardest",
  medium: "Medium",
  easier: "Easier",
};

export default function PersonaCoachClient({ personas }: { personas: PersonaSummary[] }) {
  const [personaId, setPersonaId] = useState<string | null>(null);
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

  function selectPersona(id: string) {
    setPersonaId(id);
    setHistory([]);
    setStreaming("");
    setError(null);
  }

  function changePersona() {
    setPersonaId(null);
    setHistory([]);
    setStreaming("");
    setError(null);
  }

  function handleReset() {
    setHistory([]);
    setStreaming("");
    setError(null);
  }

  if (!activePersona) {
    return (
      <div className="persona-coach__shell">
        <div className="persona-coach__grid" data-testid="persona-coach-grid">
          {personas.map((p) => (
            <button
              key={p.id}
              type="button"
              className="persona-card"
              data-testid="persona-card"
              data-persona-id={p.id}
              onClick={() => selectPersona(p.id)}
            >
              <span className={`persona-card__badge persona-card__badge--${p.difficulty}`}>
                {DIFFICULTY_LABEL[p.difficulty]}
              </span>
              <div className="persona-card__avatar" aria-hidden>
                {p.initials}
              </div>
              <h2 className="persona-card__name">{p.name}</h2>
              <p className="persona-card__role">{p.role}</p>
              <p className="persona-card__context">{p.context.join(" · ")}</p>
              <ul className="persona-card__traits">
                {p.traits.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <p className="persona-card__blurb">{p.blurb}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="persona-coach__shell">
      <div className="persona-coach__selected" data-testid="persona-coach-selected">
        <div className="persona-coach__selected-avatar" aria-hidden>
          {activePersona.initials}
        </div>
        <div className="persona-coach__selected-meta">
          <h2>{activePersona.name}</h2>
          <p>{activePersona.role}</p>
        </div>
        <div className="persona-coach__selected-goal">
          <span className="persona-coach__goal-dot" aria-hidden />
          {activePersona.goal}
        </div>
        <button
          type="button"
          className="persona-coach__change"
          onClick={changePersona}
          disabled={loading}
          data-testid="persona-coach-change"
        >
          ↔ Change
        </button>
      </div>

      <div className="persona-coach__objections" data-testid="persona-coach-objections">
        <span className="persona-coach__objections-label">Objections to expect:</span>
        <ul>
          {activePersona.objections.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </div>

      {history.length > 0 ? (
        <div className="persona-coach__transcript" data-testid="persona-coach-transcript">
          {history.map((m, i) => (
            <div key={i} className={`persona-coach__msg persona-coach__msg--${m.role}`}>
              <span className="persona-coach__role">
                {m.role === "user" ? "You" : activePersona.name}
              </span>
              <p>{m.content}</p>
            </div>
          ))}
          {streaming && (
            <div className="persona-coach__msg persona-coach__msg--assistant">
              <span className="persona-coach__role">{activePersona.name}</span>
              <p>{streaming}</p>
            </div>
          )}
        </div>
      ) : (
        <p className="persona-coach__empty">
          Open the call below — {activePersona.name} will reply in character.
        </p>
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
              ? "Open the call. e.g. 'Hi Marcus, thanks for the time. Mind if I share why I reached out?'"
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
            disabled={loading || !input.trim()}
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
