"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Loader2, Play, Volume2, VolumeX, Send, ArrowRight,
  Flag, AlertCircle, RotateCcw, ClipboardList,
} from "lucide-react";

import { VoiceAnswerInput } from "./VoiceAnswerInput";
import { InterviewFeedbackCard } from "./InterviewFeedbackCard";
import { InterviewFinalReport } from "./InterviewFinalReport";
import type {
  Difficulty, Feedback, FinalReport, HistoryItem,
  InterviewConfig, InterviewType, Locale,
} from "./types";

const MAX_QUESTIONS = 5;
const STORAGE_KEY = "tenun-mock-interview-session";

type Phase = "setup" | "interview" | "report";

interface PersistedSession {
  phase: Phase;
  config: InterviewConfig;
  sessionPlan: string[];
  history: HistoryItem[];
  currentQuestion: string;
  currentAnswer: string;
  currentFeedback: Feedback | null;
  pendingNext: string | null;
  questionNumber: number;
  finalReport: FinalReport | null;
}

const INTERVIEW_TYPES: { id: InterviewType; label: string; hint: string }[] = [
  { id: "general", label: "General", hint: "A mix of common questions" },
  { id: "behavioural", label: "Behavioural", hint: "Teamwork, conflict, STAR" },
  { id: "technical", label: "Technical", hint: "Role-specific knowledge" },
  { id: "cv_based", label: "CV-based", hint: "Grounded in your CV" },
];

const DIFFICULTIES: { id: Difficulty; label: string }[] = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "challenging", label: "Challenging" },
];

const DEFAULT_CONFIG: InterviewConfig = {
  targetRole: "",
  interviewType: "general",
  difficulty: "medium",
  cvContext: "",
};

function readLocale(): Locale {
  try {
    return window.localStorage.getItem("tenun-locale") === "ms" ? "ms" : "en";
  } catch {
    return "en";
  }
}

interface ApiResponse {
  question?: string | null;
  sessionPlan?: string[];
  feedback?: Feedback | null;
  nextQuestion?: string | null;
  finalReport?: FinalReport | null;
  error?: string;
}

export function MockInterviewSession() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [config, setConfig] = useState<InterviewConfig>(DEFAULT_CONFIG);
  const [showCvInput, setShowCvInput] = useState(false);

  const [sessionPlan, setSessionPlan] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null);
  const [pendingNext, setPendingNext] = useState<string | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [finalReport, setFinalReport] = useState<FinalReport | null>(null);

  const [loadingAction, setLoadingAction] = useState<"start" | "evaluate" | "next" | "report" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [restored, setRestored] = useState(false);
  const localeRef = useRef<Locale>("en");

  // ── Restore any saved session on mount (so a refresh doesn't lose progress) ─
  useEffect(() => {
    localeRef.current = readLocale();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as PersistedSession;
        if (s && s.phase) {
          setPhase(s.phase);
          setConfig(s.config ?? DEFAULT_CONFIG);
          setSessionPlan(s.sessionPlan ?? []);
          setHistory(s.history ?? []);
          setCurrentQuestion(s.currentQuestion ?? "");
          setCurrentAnswer(s.currentAnswer ?? "");
          setCurrentFeedback(s.currentFeedback ?? null);
          setPendingNext(s.pendingNext ?? null);
          setQuestionNumber(s.questionNumber ?? 1);
          setFinalReport(s.finalReport ?? null);
          if (s.config?.cvContext) setShowCvInput(true);
        }
      }
    } catch {
      /* ignore corrupt storage */
    }
    setRestored(true);
  }, []);

  // ── Persist the session whenever meaningful state changes ───────────────────
  useEffect(() => {
    if (!restored) return;
    if (phase === "setup" && history.length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    const snapshot: PersistedSession = {
      phase, config, sessionPlan, history, currentQuestion,
      currentAnswer, currentFeedback, pendingNext, questionNumber, finalReport,
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      /* storage full / unavailable — non-fatal */
    }
  }, [restored, phase, config, sessionPlan, history, currentQuestion,
      currentAnswer, currentFeedback, pendingNext, questionNumber, finalReport]);

  // ── Text-to-speech ──────────────────────────────────────────────────────────
  const [ttsSupported, setTtsSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    setTtsSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopSpeaking = useCallback(() => {
    if (!ttsSupported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [ttsSupported]);

  const speak = useCallback((text: string) => {
    if (!ttsSupported || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = localeRef.current === "ms" ? "ms-MY" : "en-US";
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [ttsSupported]);

  // Stop any narration whenever the question changes / phase changes.
  useEffect(() => {
    stopSpeaking();
  }, [currentQuestion, phase, stopSpeaking]);

  // ── API helper ────────────────────────────────────────────────────────────
  const callApi = useCallback(async (payload: Record<string, unknown>): Promise<ApiResponse> => {
    const res = await fetch("/api/mock-interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, locale: localeRef.current }),
    });
    const data = (await res.json().catch(() => ({}))) as ApiResponse;
    if (!res.ok) {
      throw new Error(data.error || "The interview coach could not respond. Please try again.");
    }
    return data;
  }, []);

  // ── Actions ─────────────────────────────────────────────────────────────────
  async function handleStart() {
    setError(null);
    setLoadingAction("start");
    try {
      const data = await callApi({
        mode: "start",
        targetRole: config.targetRole,
        interviewType: config.interviewType,
        difficulty: config.difficulty,
        cvContext: config.cvContext,
      });
      if (!data.question) throw new Error("The interview coach did not return a question. Please try again.");
      setSessionPlan(data.sessionPlan ?? []);
      setHistory([]);
      setCurrentQuestion(data.question);
      setCurrentAnswer("");
      setCurrentFeedback(null);
      setPendingNext(null);
      setQuestionNumber(1);
      setFinalReport(null);
      setPhase("interview");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start the interview.");
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleSubmitAnswer() {
    if (!currentAnswer.trim()) {
      setError("Please type or speak an answer before submitting. Add a concrete example if you can.");
      return;
    }
    setError(null);
    setLoadingAction("evaluate");
    try {
      const data = await callApi({
        mode: "evaluate_answer",
        targetRole: config.targetRole,
        interviewType: config.interviewType,
        difficulty: config.difficulty,
        cvContext: config.cvContext,
        currentQuestion,
        answer: currentAnswer,
        history,
      });
      if (!data.feedback) throw new Error("The interview coach did not return feedback. Please try again.");
      setHistory((prev) => [
        ...prev,
        { question: currentQuestion, answer: currentAnswer, feedback: data.feedback ?? undefined },
      ]);
      setCurrentFeedback(data.feedback);
      setPendingNext(data.nextQuestion ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not evaluate your answer.");
    } finally {
      setLoadingAction(null);
    }
  }

  const answeredCount = history.length;
  const isLastQuestion = answeredCount >= MAX_QUESTIONS || (currentFeedback !== null && !pendingNext);

  async function handleNextQuestion() {
    if (!pendingNext || answeredCount >= MAX_QUESTIONS) {
      await handleEndSession();
      return;
    }
    setCurrentQuestion(pendingNext);
    setCurrentAnswer("");
    setCurrentFeedback(null);
    setPendingNext(null);
    setQuestionNumber((n) => n + 1);
    setError(null);
  }

  async function handleEndSession() {
    setError(null);
    setLoadingAction("report");
    try {
      const data = await callApi({
        mode: "final_report",
        targetRole: config.targetRole,
        interviewType: config.interviewType,
        difficulty: config.difficulty,
        cvContext: config.cvContext,
        history,
      });
      if (!data.finalReport) throw new Error("Could not generate the final report. Please try again.");
      setFinalReport(data.finalReport);
      setPhase("report");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate the final report.");
    } finally {
      setLoadingAction(null);
    }
  }

  function handleRestart() {
    stopSpeaking();
    window.localStorage.removeItem(STORAGE_KEY);
    setPhase("setup");
    setConfig((c) => ({ ...c, targetRole: c.targetRole })); // keep role for convenience
    setSessionPlan([]);
    setHistory([]);
    setCurrentQuestion("");
    setCurrentAnswer("");
    setCurrentFeedback(null);
    setPendingNext(null);
    setQuestionNumber(1);
    setFinalReport(null);
    setError(null);
  }

  const speechLang = localeRef.current === "ms" ? "ms-MY" : "en-US";
  const busy = loadingAction !== null;

  // Avoid a flash of the setup screen before we know whether a saved session exists.
  if (!restored) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={22} className="animate-spin text-[#0a1628]" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5">
      {/* Global error banner */}
      {error && (
        <div role="alert" className="flex items-start gap-2 p-3.5 rounded-xl bg-red-50 border border-red-200">
          <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-sm text-red-700 leading-snug">{error}</p>
        </div>
      )}

      {/* ── SETUP ─────────────────────────────────────────────────────────── */}
      {phase === "setup" && (
        <div className="bg-white rounded-2xl border border-beige-300 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-navy-900">Set up your practice interview</h2>
            <p className="text-sm text-navy-500 mt-1">
              Choose a role and style. The AI interviewer will ask about {MAX_QUESTIONS} questions, one at a time.
            </p>
          </div>

          {/* Target role */}
          <div>
            <label htmlFor="targetRole" className="block text-sm font-semibold text-navy-900 mb-1.5">
              Target role
            </label>
            <input
              id="targetRole"
              type="text"
              value={config.targetRole}
              onChange={(e) => setConfig((c) => ({ ...c, targetRole: e.target.value }))}
              placeholder="e.g. Product Manager, Software Engineer, Marketing Executive"
              className="w-full px-4 py-3 rounded-xl border border-beige-300 bg-white text-sm text-navy-900 placeholder:text-navy-300 focus:outline-none focus:border-navy-400 focus:ring-2 focus:ring-[#d4a017]/20 transition-all"
            />
          </div>

          {/* Interview type */}
          <div>
            <span className="block text-sm font-semibold text-navy-900 mb-2">Interview type</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {INTERVIEW_TYPES.map((t) => {
                const selected = config.interviewType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setConfig((c) => ({ ...c, interviewType: t.id }));
                      if (t.id === "cv_based") setShowCvInput(true);
                    }}
                    className={[
                      "text-left p-3 rounded-xl border-2 transition-all",
                      selected ? "border-[#0a1628] bg-[#0a1628]/5" : "border-beige-300 hover:border-beige-500",
                    ].join(" ")}
                  >
                    <p className="text-sm font-semibold text-navy-900">{t.label}</p>
                    <p className="text-xs text-navy-400 mt-0.5">{t.hint}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <span className="block text-sm font-semibold text-navy-900 mb-2">Difficulty</span>
            <div className="grid grid-cols-3 gap-2.5">
              {DIFFICULTIES.map((d) => {
                const selected = config.difficulty === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setConfig((c) => ({ ...c, difficulty: d.id }))}
                    className={[
                      "py-2.5 rounded-xl border-2 text-sm font-semibold transition-all",
                      selected ? "border-[#d4a017] bg-[#d4a017]/10 text-navy-900" : "border-beige-300 text-navy-500 hover:border-beige-500",
                    ].join(" ")}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional CV context */}
          <div>
            {!showCvInput ? (
              <button
                type="button"
                onClick={() => setShowCvInput(true)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-600 hover:text-navy-900 transition-colors"
              >
                <ClipboardList size={15} aria-hidden="true" /> Add optional CV context
              </button>
            ) : (
              <div>
                <label htmlFor="cvContext" className="block text-sm font-semibold text-navy-900 mb-1.5">
                  CV context <span className="font-normal text-navy-400">(optional)</span>
                </label>
                <p className="text-xs text-navy-400 mb-2">
                  Paste a few lines from your CV so the AI can ask more relevant questions. Nothing is stored on a server.
                </p>
                <textarea
                  id="cvContext"
                  value={config.cvContext}
                  onChange={(e) => setConfig((c) => ({ ...c, cvContext: e.target.value }))}
                  rows={4}
                  placeholder="e.g. Final-year Computer Science student. Built a React + Supabase dashboard. Led a 4-person hackathon team..."
                  className="w-full px-4 py-3 rounded-xl border border-beige-300 bg-white text-sm text-navy-900 placeholder:text-navy-300 focus:outline-none focus:border-navy-400 focus:ring-2 focus:ring-[#d4a017]/20 transition-all resize-y"
                />
              </div>
            )}
          </div>

          <button
            onClick={handleStart}
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0a1628] text-white text-sm font-semibold hover:bg-[#1a2a4a] transition-colors disabled:opacity-60"
          >
            {loadingAction === "start" ? (
              <><Loader2 size={16} className="animate-spin" aria-hidden="true" /> Preparing your interview…</>
            ) : (
              <><Play size={16} aria-hidden="true" /> Start interview</>
            )}
          </button>
        </div>
      )}

      {/* ── INTERVIEW ─────────────────────────────────────────────────────── */}
      {phase === "interview" && (
        <div className="space-y-5">
          {/* Progress */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-navy-900">
              Question {Math.min(questionNumber, MAX_QUESTIONS)}{" "}
              <span className="font-normal text-navy-400">of {MAX_QUESTIONS}</span>
            </p>
            {config.targetRole && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#d4a017]/15 text-[#a97d12] border border-[#d4a017]/20">
                {config.targetRole}
              </span>
            )}
          </div>
          <div className="h-1.5 w-full rounded-full bg-beige-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#d4a017] transition-all"
              style={{ width: `${(Math.min(questionNumber, MAX_QUESTIONS) / MAX_QUESTIONS) * 100}%` }}
            />
          </div>

          {/* Question card */}
          <div className="bg-white rounded-2xl border border-beige-300 shadow-sm p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-navy-400 mb-1.5">Interviewer asks</p>
                <p className="text-base text-navy-900 leading-relaxed">{currentQuestion}</p>
              </div>
              {ttsSupported && (
                <button
                  type="button"
                  onClick={() => (speaking ? stopSpeaking() : speak(currentQuestion))}
                  aria-label={speaking ? "Stop reading the question aloud" : "Read the question aloud"}
                  className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg border border-beige-300 text-navy-600 hover:border-navy-300 hover:text-navy-900 transition-colors"
                >
                  {speaking ? <VolumeX size={17} aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />}
                </button>
              )}
            </div>
          </div>

          {/* Answer + feedback */}
          {!currentFeedback ? (
            <div className="bg-white rounded-2xl border border-beige-300 shadow-sm p-5 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">Your answer</p>
              <VoiceAnswerInput
                value={currentAnswer}
                onChange={setCurrentAnswer}
                disabled={loadingAction === "evaluate"}
                lang={speechLang}
              />
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={busy}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0a1628] text-white text-sm font-semibold hover:bg-[#1a2a4a] transition-colors disabled:opacity-60"
                >
                  {loadingAction === "evaluate" ? (
                    <><Loader2 size={16} className="animate-spin" aria-hidden="true" /> Evaluating your answer…</>
                  ) : (
                    <><Send size={15} aria-hidden="true" /> Submit answer</>
                  )}
                </button>
                <button
                  onClick={handleEndSession}
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-beige-300 text-navy-600 text-sm font-semibold hover:border-navy-300 hover:text-navy-900 transition-colors disabled:opacity-60"
                >
                  <Flag size={15} aria-hidden="true" /> End session
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <InterviewFeedbackCard feedback={currentFeedback} />
              <div className="flex flex-col sm:flex-row gap-2.5">
                {!isLastQuestion ? (
                  <button
                    onClick={handleNextQuestion}
                    disabled={busy}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0a1628] text-white text-sm font-semibold hover:bg-[#1a2a4a] transition-colors disabled:opacity-60"
                  >
                    <ArrowRight size={15} aria-hidden="true" /> Next question
                  </button>
                ) : (
                  <button
                    onClick={handleEndSession}
                    disabled={busy}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#d4a017] text-[#0a1628] text-sm font-semibold hover:bg-[#e0ad1c] transition-colors disabled:opacity-60"
                  >
                    {loadingAction === "report" ? (
                      <><Loader2 size={16} className="animate-spin" aria-hidden="true" /> Building your report…</>
                    ) : (
                      <><Flag size={15} aria-hidden="true" /> Finish & see report</>
                    )}
                  </button>
                )}
                {!isLastQuestion && (
                  <button
                    onClick={handleEndSession}
                    disabled={busy}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-beige-300 text-navy-600 text-sm font-semibold hover:border-navy-300 hover:text-navy-900 transition-colors disabled:opacity-60"
                  >
                    {loadingAction === "report" ? (
                      <><Loader2 size={15} className="animate-spin" aria-hidden="true" /> Report…</>
                    ) : (
                      <><Flag size={15} aria-hidden="true" /> End session</>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Session plan reference */}
          {sessionPlan.length > 0 && (
            <details className="bg-white/60 rounded-xl border border-beige-200 px-4 py-3">
              <summary className="text-xs font-semibold text-navy-500 cursor-pointer select-none">
                Session plan ({sessionPlan.length} questions)
              </summary>
              <ol className="mt-2 space-y-1 list-decimal list-inside">
                {sessionPlan.map((item, i) => (
                  <li key={i} className="text-xs text-navy-500">{item}</li>
                ))}
              </ol>
            </details>
          )}

          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-1.5 text-xs text-navy-400 hover:text-navy-700 transition-colors"
          >
            <RotateCcw size={13} aria-hidden="true" /> Start over with new settings
          </button>
        </div>
      )}

      {/* ── REPORT ────────────────────────────────────────────────────────── */}
      {phase === "report" && finalReport && (
        <InterviewFinalReport report={finalReport} onRestart={handleRestart} />
      )}
    </div>
  );
}
