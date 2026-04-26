"use client";

import { useRef, useState } from "react";
import { useBrowserTts } from "../_lib/useBrowserTts";
import { useBrowserStt } from "../_lib/useBrowserStt";
import { SCENARIOS, SUBURBS, getScenario, type ScenarioId } from "./_data/scenarios";

type Msg = { role: "user" | "assistant"; content: string };
type Phase = "idle" | "active" | "ended";

type Scorecard = {
  metrics: {
    clarity: number;
    relevance: number;
    objection_handling: number;
    rapport: number;
    cta_strength: number;
  };
  overall: number;
  strengths: string[];
  improvements: string[];
  suggested_rewrite: string;
  summary: string;
};

const METRIC_LABELS: { key: keyof Scorecard["metrics"]; label: string }[] = [
  { key: "clarity", label: "Clarity" },
  { key: "relevance", label: "Relevance" },
  { key: "objection_handling", label: "Objections" },
  { key: "rapport", label: "Rapport" },
  { key: "cta_strength", label: "CTA" },
];

export default function PitchCoachClient() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<Msg[]>([]);
  const [streaming, setStreaming] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState<Scorecard | null>(null);
  const [scoring, setScoring] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [scenario, setScenario] = useState<ScenarioId>(SCENARIOS[0].id);
  const [suburb, setSuburb] = useState<string>(SUBURBS[0]);
  const tts = useBrowserTts();
  const stt = useBrowserStt();
  const sttBaseRef = useRef("");

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

  function statusText() {
    if (phase === "idle") return "Ready — start a coaching session.";
    if (phase === "ended") return "Session ended.";
    if (stt.listening) return "Listening…";
    if (tts.isSpeaking) return "Coach speaking…";
    return "Coach live.";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading || phase !== "active") return;
    if (stt.listening) stt.stop();
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
        body: JSON.stringify({ messages: next, scenario, suburb }),
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
    const openerText = getScenario(scenario)?.opener ?? SCENARIOS[0].opener;
    const opener: Msg = { role: "assistant", content: openerText };
    setHistory([opener]);
    setStreaming("");
    setError(null);
    setScore(null);
    setScoreError(null);
    setPhase("active");
    void tts.speak(openerText);
  }

  function endSession() {
    tts.stop();
    stt.stop();
    setPhase("ended");
  }

  async function scoreSession() {
    if (scoring) return;
    if (!history.some((m) => m.role === "user")) return;
    setScoring(true);
    setScoreError(null);
    try {
      const res = await fetch("/api/score-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: "pitch-coach",
          messages: history,
        }),
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const card = (await res.json()) as Scorecard;
      setScore(card);
    } catch (err) {
      setScoreError(err instanceof Error ? err.message : String(err));
    } finally {
      setScoring(false);
    }
  }

  return (
    <div className="pitch-coach__shell">
      <div className="pitch-coach__statusbar" data-testid="pitch-coach-statusbar">
        <span className="pitch-coach__voice" data-testid="pitch-coach-voice">
          {tts.voiceLabel}
        </span>
        <span className="pitch-coach__status">{statusText()}</span>
      </div>

      {phase === "idle" ? (
        <div className="pitch-coach__startbar">
          <div className="pitch-coach__selectors">
            <label className="pitch-coach__select-field">
              <span className="pitch-coach__select-label">Scenario</span>
              <select
                className="pitch-coach__select"
                data-testid="pitch-coach-scenario"
                value={scenario}
                onChange={(e) => setScenario(e.target.value as ScenarioId)}
              >
                {SCENARIOS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="pitch-coach__select-field">
              <span className="pitch-coach__select-label">Lead suburb</span>
              <select
                className="pitch-coach__select"
                data-testid="pitch-coach-suburb"
                value={suburb}
                onChange={(e) => setSuburb(e.target.value)}
              >
                {SUBURBS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="pitch-coach__empty">
            Pick a scenario and the lead's suburb, then start — the coach will open in role.
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
                  className={`pitch-coach__mic${stt.listening ? " pitch-coach__mic--listening" : ""}`}
                  onClick={toggleMic}
                  disabled={loading || !stt.supported}
                  aria-pressed={stt.listening}
                  data-testid="pitch-coach-mic"
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

          {phase === "ended" && history.some((m) => m.role === "user") && !score && (
            <div className="pitch-coach__scorebar">
              <button
                type="button"
                className="pitch-coach__score-btn"
                onClick={scoreSession}
                disabled={scoring}
                data-testid="pitch-coach-score"
              >
                {scoring ? "Scoring…" : "★ Score this session"}
              </button>
              {scoreError && (
                <p className="pitch-coach__error" data-testid="pitch-coach-score-error">
                  Error: {scoreError}
                </p>
              )}
            </div>
          )}

          {score && (
            <section className="pitch-coach__scorecard" data-testid="pitch-coach-scorecard">
              <header className="pitch-coach__scorecard-header">
                <span className="pitch-coach__scorecard-eyebrow">Session score</span>
                <span
                  className="pitch-coach__scorecard-overall"
                  data-testid="pitch-coach-scorecard-overall"
                >
                  {score.overall}
                  <span className="pitch-coach__scorecard-overall-suffix">/10</span>
                </span>
              </header>

              <ul className="pitch-coach__scorecard-metrics">
                {METRIC_LABELS.map(({ key, label }) => (
                  <li key={key} className="pitch-coach__scorecard-pill">
                    <span className="pitch-coach__scorecard-pill-label">{label}</span>
                    <span className="pitch-coach__scorecard-pill-value">
                      {score.metrics[key]}
                    </span>
                  </li>
                ))}
              </ul>

              {score.summary && (
                <p
                  className="pitch-coach__scorecard-summary"
                  data-testid="pitch-coach-scorecard-summary"
                >
                  {score.summary}
                </p>
              )}

              <div className="pitch-coach__scorecard-grid">
                {score.strengths.length > 0 && (
                  <div className="pitch-coach__scorecard-block">
                    <h3>Strengths</h3>
                    <ul>
                      {score.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {score.improvements.length > 0 && (
                  <div className="pitch-coach__scorecard-block">
                    <h3>Improvements</h3>
                    <ul>
                      {score.improvements.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {score.suggested_rewrite && (
                <div className="pitch-coach__scorecard-rewrite">
                  <span className="pitch-coach__scorecard-rewrite-label">Suggested rewrite</span>
                  <p>{score.suggested_rewrite}</p>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
