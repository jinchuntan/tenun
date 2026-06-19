"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/store/hooks";
import { completeGame } from "@/store/slices/simulatorSlice";
import { checkAnswer } from "@/lib/simulator/engine";
import { HR_WEEK, type EmailCase } from "@/lib/simulator/games/hr-inbox";
import type { Game, StepResult, GameResult } from "@/lib/simulator/types";

type Mode = "briefing" | "inbox" | "review";
interface Outcome {
  correct: boolean;
  feedback: string;
}

const CATEGORY_STYLE: Record<string, string> = {
  Onboarding: "bg-sky-100 text-sky-700",
  Payroll: "bg-emerald-100 text-emerald-700",
  IT: "bg-slate-100 text-slate-700",
  Leave: "bg-violet-100 text-violet-700",
  Routing: "bg-amber-100 text-amber-700",
  Security: "bg-red-100 text-red-700",
  Sensitive: "bg-rose-100 text-rose-700",
  Compliance: "bg-indigo-100 text-indigo-700",
  Offboarding: "bg-orange-100 text-orange-700",
};

function initials(name: string): string {
  return name.replace(/[^a-zA-Z ]/g, "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
}

export function HrPlayer({ game }: { game: Game }) {
  const dispatch = useAppDispatch();
  const [mode, setMode] = useState<Mode>("briefing");
  const [dayIndex, setDayIndex] = useState(0);
  const [outcomes, setOutcomes] = useState<Record<string, Outcome>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openAtt, setOpenAtt] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [composeError, setComposeError] = useState(false);

  const day = HR_WEEK[dayIndex];
  const isLastDay = dayIndex === HR_WEEK.length - 1;
  const todayResolved = day.cases.filter((c) => outcomes[c.id]).length;
  const dayDone = todayResolved === day.cases.length;

  const selected = useMemo(
    () => day.cases.find((c) => c.id === selectedId) ?? null,
    [day, selectedId]
  );

  function openInbox() {
    setMode("inbox");
    selectCase(day.cases[0].id);
  }

  function selectCase(id: string) {
    setSelectedId(id);
    setOpenAtt([]);
    setDraft("");
    setComposeError(false);
  }

  function resolveAction(c: EmailCase, actionId: string) {
    const action = c.actions!.find((a) => a.id === actionId)!;
    setOutcomes((o) => ({ ...o, [c.id]: { correct: action.correct, feedback: action.feedback } }));
  }

  function sendCompose(c: EmailCase) {
    const ok = checkAnswer(draft, c.compose!.check);
    if (!ok) {
      setComposeError(true);
      return;
    }
    setOutcomes((o) => ({ ...o, [c.id]: { correct: true, feedback: c.compose!.feedback } }));
  }

  function nextDay() {
    if (isLastDay) {
      dispatch(completeGame(buildResult(game, outcomes)));
      return;
    }
    setDayIndex((i) => i + 1);
    setMode("briefing");
    setSelectedId(null);
  }

  // ── Briefing title card (FNAF-style day intro) ─────────────────────────────
  if (mode === "briefing") {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border-2 border-navy-200 bg-navy-900 p-8 text-center text-white shadow-lg">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold-400">
          {dayLabel(dayIndex)}
        </p>
        <p className="mt-2 font-display text-5xl">Day {day.number}</p>
        <p className="mt-1 text-sm text-white/50">of {HR_WEEK.length}</p>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-white/80">{day.briefing}</p>
        <Button className="mt-6 bg-gold-500 hover:bg-gold-600" size="lg" onClick={openInbox}>
          Open inbox →
        </Button>
      </div>
    );
  }

  // ── End-of-day review ──────────────────────────────────────────────────────
  if (mode === "review") {
    const good = day.cases.filter((c) => outcomes[c.id]?.correct).length;
    return (
      <div className="mx-auto max-w-xl rounded-2xl border-2 border-beige-200 bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-gold-600">
          Day {day.number} — wrap-up
        </p>
        <p className="mt-3 font-display text-3xl text-navy-900">
          {good} / {day.cases.length} handled well
        </p>
        <p className="mt-2 text-sm text-navy-500">
          {good === day.cases.length
            ? "Spotless day — every call was the right one."
            : "Some tricky ones in there. Your full review comes at the end of the week."}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          {day.cases.map((c) => (
            <span
              key={c.id}
              className={cn(
                "h-2.5 w-7 rounded-full",
                outcomes[c.id]?.correct ? "bg-emerald-400" : "bg-amber-300"
              )}
            />
          ))}
        </div>
        <Button className="mt-6" size="lg" onClick={nextDay}>
          {isLastDay ? "See your week's review →" : `Start Day ${day.number + 1} →`}
        </Button>
      </div>
    );
  }

  // ── Inbox (Outlook 3-pane) ─────────────────────────────────────────────────
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-white shadow-sm lg:h-[640px]">
      <div className="grid h-full lg:grid-cols-[180px_280px_1fr]">
        {/* Folder rail */}
        <aside className="hidden flex-col border-r border-slate-200 bg-slate-50 p-3 lg:flex">
          <p className="px-1 text-sm font-bold text-navy-900">Tenun Mail</p>
          <div className="mt-4 space-y-1 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-navy-100 px-3 py-1.5 font-medium text-navy-900">
              <span>Inbox</span>
              <span className="text-xs">{day.cases.length - todayResolved}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg px-3 py-1.5 text-navy-500">
              <span>Done</span>
              <span className="text-xs">{todayResolved}</span>
            </div>
          </div>
          <div className="mt-auto rounded-xl bg-navy-900 p-3 text-center text-white">
            <p className="font-mono text-[10px] uppercase tracking-widest text-gold-400">Day</p>
            <p className="font-display text-2xl leading-none">
              {day.number}
              <span className="text-sm text-white/40"> / {HR_WEEK.length}</span>
            </p>
            <p className="mt-1 text-[11px] text-white/60">{todayResolved}/{day.cases.length} handled</p>
          </div>
        </aside>

        {/* Message list */}
        <div className="flex flex-col border-r border-slate-200 lg:overflow-y-auto">
          <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5">
            <span className="text-sm font-semibold text-navy-900">Inbox · Day {day.number}</span>
            <span className="text-xs text-navy-400">{day.cases.length} emails</span>
          </div>
          {day.cases.map((c) => {
            const done = !!outcomes[c.id];
            const active = selectedId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => selectCase(c.id)}
                className={cn(
                  "flex gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors",
                  active ? "bg-navy-50" : "hover:bg-slate-50",
                  done && !active && "opacity-60"
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                    done ? "bg-emerald-500" : "bg-navy-400"
                  )}
                >
                  {done ? "✓" : initials(c.from.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className={cn("truncate text-sm", done ? "text-navy-500" : "font-semibold text-navy-900")}>
                      {c.from.name}
                    </span>
                    <span className="shrink-0 text-[11px] text-navy-400">{c.time}</span>
                  </span>
                  <span className="block truncate text-[13px] text-navy-700">{c.subject}</span>
                  <span className="block truncate text-xs text-navy-400">{c.body[0]}</span>
                </span>
              </button>
            );
          })}

          {dayDone && (
            <div className="sticky bottom-0 border-t border-slate-200 bg-white p-3">
              <Button className="w-full" onClick={() => setMode("review")}>
                End Day {day.number} →
              </Button>
            </div>
          )}
        </div>

        {/* Reading pane */}
        <div className="lg:overflow-y-auto">
          {selected ? (
            <ReadingPane
              c={selected}
              outcome={outcomes[selected.id]}
              openAtt={openAtt}
              setOpenAtt={setOpenAtt}
              draft={draft}
              setDraft={setDraft}
              composeError={composeError}
              onAction={(aid) => resolveAction(selected, aid)}
              onSend={() => sendCompose(selected)}
            />
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-sm text-navy-400">
              Select an email to read it.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReadingPane({
  c, outcome, openAtt, setOpenAtt, draft, setDraft, composeError, onAction, onSend,
}: {
  c: EmailCase;
  outcome?: Outcome;
  openAtt: string[];
  setOpenAtt: (v: string[]) => void;
  draft: string;
  setDraft: (v: string) => void;
  composeError: boolean;
  onAction: (actionId: string) => void;
  onSend: () => void;
}) {
  const resolved = !!outcome;
  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-navy-900">{c.subject}</h2>
        <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", CATEGORY_STYLE[c.category])}>
          {c.category}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-3 border-b border-slate-200 pb-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-400 text-sm font-bold text-white">
          {initials(c.from.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-navy-900">{c.from.name}</p>
          <p className="truncate text-xs text-navy-400">{c.from.role} · {c.time}</p>
        </div>
      </div>

      <div className="space-y-3 py-4 text-sm leading-relaxed text-navy-700">
        {c.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {/* Investigation hint + attachments */}
      {c.attachments && c.attachments.length > 0 && (
        <div className="mb-4 space-y-2">
          {c.investigate && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              🔍 {c.investigate}
            </p>
          )}
          {c.attachments.map((att) => {
            const open = openAtt.includes(att.id);
            return (
              <div key={att.id} className="rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() =>
                    setOpenAtt(open ? openAtt.filter((x) => x !== att.id) : [...openAtt, att.id])
                  }
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  <span className="text-base">📎</span>
                  <span className="font-medium text-navy-800">{att.name}</span>
                  <span className="ml-auto text-xs text-navy-400">{open ? "Hide" : "Open"}</span>
                </button>
                {open && (
                  <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs leading-relaxed text-slate-700">
                    {att.lines.map((l, i) => (
                      <p key={i}>{l}</p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Resolution */}
      {resolved ? (
        <div
          className={cn(
            "rounded-xl border-2 p-4 text-sm leading-relaxed",
            outcome!.correct
              ? "border-emerald-300 bg-emerald-50 text-emerald-900"
              : "border-amber-300 bg-amber-50 text-amber-900"
          )}
        >
          <p className="mb-1 font-semibold">{outcome!.correct ? "Good call." : "Not the best call."}</p>
          <p>{outcome!.feedback}</p>
          {c.mode === "compose" && (
            <p className="mt-2 rounded-lg bg-white/60 px-3 py-2 text-xs text-navy-700">
              <span className="font-semibold text-navy-600">Reference reply: </span>
              {c.compose!.exemplar}
            </p>
          )}
          <p className="mt-2 border-t border-current/20 pt-2 text-xs opacity-80">💡 {c.lesson}</p>
        </div>
      ) : c.mode === "action" ? (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-navy-400">What do you do?</p>
          <div className="flex flex-wrap gap-2">
            {c.actions!.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => onAction(a.id)}
                className="rounded-lg border-2 border-navy-200 bg-white px-3 py-2 text-sm font-medium text-navy-800 transition-all hover:border-navy-500 hover:bg-navy-50"
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-navy-400">Write your reply</p>
          <textarea
            value={draft}
            rows={5}
            placeholder={c.compose!.placeholder}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full resize-y rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-sm text-navy-900 focus:border-navy-400 focus:outline-none"
          />
          {composeError && (
            <p className="text-xs text-amber-700">
              💡 Re-read what they need — cover the key point, with the right tone, before sending.
            </p>
          )}
          <Button onClick={onSend} disabled={draft.trim().length === 0}>
            Send reply
          </Button>
        </div>
      )}
    </div>
  );
}

function dayLabel(i: number): string {
  return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][i] ?? "Day";
}

// One StepResult per email (right call = correct) for the shared portfolio result.
function buildResult(game: Game, outcomes: Record<string, Outcome>): GameResult {
  const steps: StepResult[] = [];
  for (const day of HR_WEEK) {
    for (const c of day.cases) {
      const correct = !!outcomes[c.id]?.correct;
      steps.push({
        stepId: c.id,
        kind: c.mode === "compose" ? "compose" : "decision",
        correct,
        awarded: correct ? c.points : 0,
        max: c.points,
        answer: { day: day.number, resolved: !!outcomes[c.id] },
      });
    }
  }
  const max = steps.reduce((s, x) => s + x.max, 0);
  const awarded = steps.reduce((s, x) => s + x.awarded, 0);
  return {
    gameId: game.id,
    role: game.role,
    steps,
    awarded,
    max,
    percent: max === 0 ? 0 : Math.round((awarded / max) * 100),
    interest: null,
    completedAt: new Date().toISOString(),
  };
}
