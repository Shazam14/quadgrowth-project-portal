"use client";

import { useRef, useState } from "react";
import { useBrowserTts } from "../_lib/useBrowserTts";
import { useBrowserStt } from "../_lib/useBrowserStt";
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
  opener: string;
};

type Msg = { role: "user" | "assistant"; content: string };
type Phase = "idle" | "active" | "ended";

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  hardest: "Hardest",
  medium: "Medium",
  easier: "Easier",
};

export default function PersonaCoachClient({ personas }: { personas: PersonaSummary[] }) {
  const [personaId, setPersonaId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<Msg[]>([]);
  const [streaming, setStreaming] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tts = useBrowserTts();
  const stt = useBrowserStt();
  const sttBaseRef = useRef("");

  const activePersona = personas.find((p) => p.id === personaId);

  function toggleMic() {
    if (stt.listening) {
      stt.stop();
      return;
    }
    tts.stop();
    sttBaseRef.current = input.trim();
    stt.start((text) => {
      const base = sttBaseRef.current;
      setInput(base ? `${base} ${text}` : text);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading || !personaId || phase !== "active") return;
    if (stt.listening) stt.stop();
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
      void tts.speak(acc);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  function selectPersona(id: string) {
    tts.stop();
    stt.stop();
    setPersonaId(id);
    setHistory([]);
    setStreaming("");
    setError(null);
    setPhase("idle");
  }

  function changePersona() {
    tts.stop();
    stt.stop();
    setPersonaId(null);
    setHistory([]);
    setStreaming("");
    setError(null);
    setPhase("idle");
  }

  function startSession() {
    if (!activePersona) return;
    const opener: Msg = { role: "assistant", content: activePersona.opener };
    setHistory([opener]);
    setStreaming("");
    setError(null);
    setPhase("active");
    void tts.speak(activePersona.opener);
  }

  function endSession() {
    tts.stop();
    stt.stop();
    setPhase("ended");
  }

  function statusText() {
    if (phase === "idle") return "Ready — start the session when you are.";
    if (phase === "ended") return "Session ended.";
    if (stt.listening) return "Listening…";
    if (tts.isSpeaking) return `${activePersona?.name ?? "Persona"} speaking…`;
    return "Live call.";
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
          disabled={loading || phase === "active"}
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

      <div className="persona-coach__statusbar" data-testid="persona-coach-statusbar">
        <span className="persona-coach__voice" data-testid="persona-coach-voice">
          {tts.voiceLabel}
        </span>
        <span className="persona-coach__status">{statusText()}</span>
      </div>

      {phase === "idle" ? (
        <div className="persona-coach__startbar">
          <p className="persona-coach__empty">
            {activePersona.name} is on the line. Start the session — they&apos;ll open the call.
          </p>
          <button
            type="button"
            className="persona-coach__start"
            onClick={startSession}
            data-testid="persona-coach-start"
          >
            ▶ Start session
          </button>
        </div>
      ) : (
        <>
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
              placeholder={phase === "ended" ? "Session ended." : "Your reply…"}
              rows={3}
              disabled={loading || phase !== "active"}
            />
            <div className="persona-coach__actions">
              <button
                type="submit"
                className="persona-coach__submit"
                data-testid="persona-coach-submit"
                disabled={loading || !input.trim() || phase !== "active"}
              >
                {loading ? "…" : "Send"}
              </button>
              {phase === "active" && (
                <button
                  type="button"
                  className={`persona-coach__mic${stt.listening ? " persona-coach__mic--listening" : ""}`}
                  onClick={toggleMic}
                  disabled={loading || !stt.supported}
                  aria-pressed={stt.listening}
                  data-testid="persona-coach-mic"
                  title={
                    stt.supported
                      ? stt.listening
                        ? "Stop dictation"
                        : "Start dictation"
                      : "Mic not supported in this browser"
                  }
                >
                  {stt.listening ? "■ Stop" : "● Mic"}
                </button>
              )}
              {phase === "active" && (
                <button
                  type="button"
                  className="persona-coach__end"
                  onClick={endSession}
                  disabled={loading}
                  data-testid="persona-coach-end"
                >
                  End session
                </button>
              )}
            </div>
            {error && (
              <p className="persona-coach__error" data-testid="persona-coach-error">
                Error: {error}
              </p>
            )}
          </form>
        </>
      )}
    </div>
  );
}
