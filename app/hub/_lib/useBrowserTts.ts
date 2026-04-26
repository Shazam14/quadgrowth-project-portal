"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const VOICE_RULES: Array<(v: SpeechSynthesisVoice) => boolean> = [
  (v) => v.name.toLowerCase().includes("karen") && v.lang.toLowerCase().includes("au"),
  (v) => v.name.toLowerCase().includes("karen"),
  (v) => v.name.toLowerCase().includes("daniel"),
  (v) => v.name.toLowerCase().includes("natasha"),
  (v) => v.name.toLowerCase().includes("libby"),
  (v) => v.name.toLowerCase().includes("sonia"),
  (v) => v.name.toLowerCase().includes("google") && v.lang.toLowerCase().includes("au"),
  (v) => v.name.toLowerCase().includes("google uk english"),
  (v) => v.lang.toLowerCase().includes("en-au"),
  (v) => v.lang.toLowerCase().includes("en-gb"),
  (v) => v.lang.toLowerCase().startsWith("en"),
];

function pickBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  for (const pred of VOICE_RULES) {
    const found = voices.find(pred);
    if (found) return found;
  }
  return voices[0];
}

export function useBrowserTts() {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [supported, setSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setSupported(true);
    const update = () => setVoice(pickBestVoice(window.speechSynthesis.getVoices()));
    update();
    window.speechSynthesis.onvoiceschanged = update;
    const fallback = setTimeout(update, 300);
    return () => {
      clearTimeout(fallback);
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    utteranceRef.current = null;
  }, []);

  const speak = useCallback(
    (text: string) => {
      return new Promise<void>((resolve) => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) {
          resolve();
          return;
        }
        const trimmed = text.trim();
        if (!trimmed) {
          resolve();
          return;
        }
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(trimmed);
        u.rate = 0.96;
        u.pitch = 1.0;
        if (voice) {
          u.voice = voice;
          u.lang = voice.lang || "en-AU";
        } else {
          u.lang = "en-AU";
        }
        u.onend = () => {
          setIsSpeaking(false);
          utteranceRef.current = null;
          resolve();
        };
        u.onerror = () => {
          setIsSpeaking(false);
          utteranceRef.current = null;
          resolve();
        };
        utteranceRef.current = u;
        setIsSpeaking(true);
        window.speechSynthesis.speak(u);
      });
    },
    [voice],
  );

  const voiceLabel = voice
    ? `Voice: ${voice.name} (${voice.lang})`
    : supported
      ? "Voice: loading…"
      : "Voice unavailable";

  return { speak, stop, voice, voiceLabel, isSpeaking, supported };
}
