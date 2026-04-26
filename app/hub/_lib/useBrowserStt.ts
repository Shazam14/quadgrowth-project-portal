"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechAlt = { transcript: string };
type SpeechResult = { isFinal: boolean; 0: SpeechAlt };
type SpeechResultList = { length: number; [i: number]: SpeechResult };
type SpeechEvent = { resultIndex: number; results: SpeechResultList };
type SpeechErrorEvent = { error?: string };

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((ev: SpeechEvent) => void) | null;
  onerror: ((ev: SpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechCtor = new () => SpeechRecognitionLike;

function getCtor(): SpeechCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechCtor;
    webkitSpeechRecognition?: SpeechCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useBrowserStt() {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setSupported(getCtor() !== null);
    return () => {
      const rec = recRef.current;
      if (rec) {
        try {
          rec.stop();
        } catch {
          /* ignore */
        }
        recRef.current = null;
      }
    };
  }, []);

  const stop = useCallback(() => {
    const rec = recRef.current;
    if (!rec) return;
    try {
      rec.stop();
    } catch {
      /* ignore */
    }
    recRef.current = null;
    setListening(false);
  }, []);

  const start = useCallback((onText: (text: string) => void) => {
    const Ctor = getCtor();
    if (!Ctor) {
      setLastError("Speech recognition not supported.");
      return;
    }
    if (recRef.current) {
      try {
        recRef.current.stop();
      } catch {
        /* ignore */
      }
      recRef.current = null;
    }
    setLastError(null);
    const rec = new Ctor();
    rec.lang = "en-AU";
    rec.continuous = true;
    rec.interimResults = true;
    let finals = "";
    rec.onstart = () => setListening(true);
    rec.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        const txt = r[0].transcript;
        if (r.isFinal) finals += txt;
        else interim += txt;
      }
      onText((finals + interim).trim());
    };
    rec.onerror = (event) => {
      setLastError(event.error || "error");
      setListening(false);
    };
    rec.onend = () => {
      setListening(false);
      recRef.current = null;
    };
    recRef.current = rec;
    try {
      rec.start();
    } catch (err) {
      setLastError(err instanceof Error ? err.message : String(err));
      setListening(false);
      recRef.current = null;
    }
  }, []);

  return { start, stop, listening, supported, lastError };
}
