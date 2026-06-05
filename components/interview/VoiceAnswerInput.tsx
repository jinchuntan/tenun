"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Square } from "lucide-react";

// ── Minimal Web Speech API typings (avoids `any`; the DOM lib doesn't ship
// these). Only the members we use are declared. ─────────────────────────────

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  readonly [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  readonly [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}
interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** BCP-47 language tag for recognition, e.g. "en-US" or "ms-MY". */
  lang?: string;
  placeholder?: string;
}

export function VoiceAnswerInput({
  value,
  onChange,
  disabled = false,
  lang = "en-US",
  placeholder,
}: Props) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [micError, setMicError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  // Keep the latest value in a ref so the recognition callbacks (created once)
  // always append to the current textarea content, not a stale closure.
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSupported(!!(window.SpeechRecognition || window.webkitSpeechRecognition));
    // Stop any active recognition if the component unmounts mid-listen.
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
    setInterim("");
  }

  function startListening() {
    if (typeof window === "undefined") return;
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) return;

    setMicError(null);
    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) finalText += transcript;
        else interimText += transcript;
      }
      setInterim(interimText);
      if (finalText) {
        const base = valueRef.current;
        const needsSpace = base.length > 0 && !/\s$/.test(base);
        onChange(`${base}${needsSpace ? " " : ""}${finalText.trim()}`);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setMicError("Microphone permission was blocked. Allow it in your browser, then try again.");
      } else if (event.error === "no-speech") {
        setMicError("No speech detected. Try speaking again.");
      } else if (event.error !== "aborted") {
        setMicError("Voice input stopped unexpectedly. You can keep typing.");
      }
      setListening(false);
      setInterim("");
    };

    recognition.onend = () => {
      setListening(false);
      setInterim("");
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      // start() throws if called while already started — ignore.
    }
  }

  return (
    <div>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={6}
          placeholder={placeholder ?? "Type your answer here, or use the microphone to speak it."}
          aria-label="Your answer"
          className="w-full px-4 py-3 pb-12 rounded-xl border border-beige-300 bg-white text-sm text-navy-900 placeholder:text-navy-300 focus:outline-none focus:border-navy-400 focus:ring-2 focus:ring-[#d4a017]/20 transition-all resize-y disabled:opacity-60"
        />

        {/* Mic control sits inside the textarea's bottom-left corner */}
        {supported && (
          <button
            type="button"
            onClick={listening ? stopListening : startListening}
            disabled={disabled}
            aria-pressed={listening}
            aria-label={listening ? "Stop listening" : "Start voice input"}
            className={[
              "absolute left-2.5 bottom-2.5 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50",
              listening
                ? "bg-red-50 text-red-600 border border-red-200"
                : "bg-navy-50 text-navy-700 border border-beige-300 hover:border-navy-300",
            ].join(" ")}
          >
            {listening ? (
              <>
                <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                </span>
                <Square size={12} aria-hidden="true" />
                Stop listening
              </>
            ) : (
              <>
                <Mic size={14} aria-hidden="true" />
                Speak answer
              </>
            )}
          </button>
        )}
      </div>

      {/* Live recording state — communicated in text, not colour alone */}
      {listening && (
        <p role="status" aria-live="polite" className="mt-2 flex items-center gap-2 text-xs font-medium text-red-600">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          Listening…{interim ? ` “${interim}”` : " speak now, then press Stop listening."}
        </p>
      )}

      {micError && (
        <p role="status" className="mt-2 text-xs text-red-600">
          {micError}
        </p>
      )}

      {!supported && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-navy-400">
          <MicOff size={13} aria-hidden="true" />
          Voice input is not supported in this browser yet. You can still type your answer.
        </p>
      )}
    </div>
  );
}
