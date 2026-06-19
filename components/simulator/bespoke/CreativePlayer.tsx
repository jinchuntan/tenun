"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, MessageCircle, Send, MoreHorizontal, Check } from "lucide-react";
import { cn, clamp } from "@/lib/utils";
import { useAppDispatch } from "@/store/hooks";
import { completeGame } from "@/store/slices/simulatorSlice";
import { checkAnswer } from "@/lib/simulator/engine";
import {
  BEATS, INITIAL_POST, BACKGROUNDS, START_SATISFACTION, EDIT_BONUS, WRONG_EDIT_PENALTY,
  type PostState, type EditTask, type BeatOption,
} from "@/lib/simulator/games/creative-client";
import type { Game, StepResult, GameResult } from "@/lib/simulator/types";

interface ChatMsg { from: "client" | "me"; text: string }
interface Pending { task: EditTask; react: string; best: boolean }

export function CreativePlayer({ game }: { game: Game }) {
  const dispatch = useAppDispatch();
  const [sat, setSat] = useState(START_SATISFACTION);
  const [beatIdx, setBeatIdx] = useState(0);
  const [post, setPost] = useState<PostState>(INITIAL_POST);
  const [chat, setChat] = useState<ChatMsg[]>(() => BEATS[0].clientMsgs.map((t) => ({ from: "client" as const, text: t })));
  const [pending, setPending] = useState<Pending | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [editNote, setEditNote] = useState<string | null>(null);
  const [ended, setEnded] = useState(false);
  const [marks, setMarks] = useState<boolean[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);

  const beat = BEATS[beatIdx];
  useEffect(() => { chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight }); }, [chat, pending]);

  function say(...msgs: ChatMsg[]) { setChat((c) => [...c, ...msgs]); }

  function finish(finalSat: number, finalMarks: boolean[]) {
    setEnded(true);
    setTimeout(() => dispatch(completeGame(buildResult(game, finalSat, finalMarks))), 1400);
  }

  function advanceBeat() {
    const next = beatIdx + 1;
    setEditNote(null);
    if (next >= BEATS.length) return; // deliver beat ends via end:true
    setBeatIdx(next);
    say(...BEATS[next].clientMsgs.map((t) => ({ from: "client" as const, text: t })));
  }

  function chooseOption(opt: BeatOption) {
    say({ from: "me", text: opt.label });
    const newMarks = [...marks, !!opt.best];
    setMarks(newMarks);
    const newSat = clamp(sat + opt.delta, 0, 100);
    setSat(newSat);

    if (newSat <= 0) {
      say({ from: "client", text: "That's it — I'll find someone else for this. 😤" });
      return finish(0, newMarks);
    }
    if (opt.edit) {
      if (opt.edit.kind === "text-free") setEditDraft(post[opt.edit.target]);
      setEditNote(null);
      setPending({ task: opt.edit, react: opt.react, best: !!opt.best });
      return;
    }
    say({ from: "client", text: opt.react });
    if (opt.end) return finish(newSat, newMarks);
    advanceBeat();
  }

  function finishEdit() {
    if (!pending) return;
    say({ from: "client", text: pending.react });
    const bonus = clamp(sat + EDIT_BONUS, 0, 100);
    setSat(bonus);
    setPending(null);
    advanceBeat();
  }

  function pickEditOption(correct: boolean, apply: () => void) {
    if (!correct) {
      setSat((s) => clamp(s - WRONG_EDIT_PENALTY, 0, 100));
      setEditNote("Hmm, not quite what they asked — try another.");
      return;
    }
    apply();
    finishEdit();
  }

  function applyTextFree() {
    if (!pending || pending.task.kind !== "text-free") return;
    if (!checkAnswer(editDraft, pending.task.check)) {
      setEditNote("That doesn't quite cover what they asked — re-read the request.");
      return;
    }
    const target = pending.task.target;
    setPost((p) => ({ ...p, [target]: editDraft }));
    finishEdit();
  }

  const satFace = sat >= 70 ? "😊" : sat >= 40 ? "😐" : sat > 0 ? "😟" : "😠";
  const satColor = sat >= 70 ? "bg-emerald-500" : sat >= 40 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* LEFT — social media editor */}
      <div className="rounded-2xl border-2 border-beige-200 bg-white p-4 shadow-sm lg:h-[640px] lg:overflow-auto">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-navy-400">Post editor</p>

        {/* Instagram-style post */}
        <div className="mx-auto max-w-sm overflow-hidden rounded-xl border border-beige-200 shadow">
          <div className="flex items-center gap-2 px-3 py-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-700 text-xs font-bold text-white">B</span>
            <span className="text-sm font-semibold text-navy-900">{post.brand}</span>
            <MoreHorizontal className="ml-auto h-4 w-4 text-navy-400" />
          </div>
          <div className={cn("relative flex h-56 items-center justify-center", BACKGROUNDS[post.background].className,
            pending?.task.kind === "visual" && "ring-4 ring-inset ring-gold-400")}>
            <ElementBox active={pending?.task.kind !== "visual" && (pending?.task as { target?: string })?.target === "headline"}>
              <span className="px-4 text-center text-3xl font-black text-white drop-shadow-lg">{post.headline}</span>
            </ElementBox>
            <span className="absolute bottom-2 right-3 text-2xl">☕</span>
          </div>
          <div className="space-y-2 px-3 py-2">
            <div className="flex gap-3 text-navy-700"><Heart className="h-5 w-5" /><MessageCircle className="h-5 w-5" /><Send className="h-5 w-5" /></div>
            <ElementBox active={(pending?.task as { target?: string })?.target === "caption"}>
              <p className="text-sm text-navy-800"><span className="font-semibold">{post.brand}</span> {post.caption}</p>
            </ElementBox>
            <ElementBox active={(pending?.task as { target?: string })?.target === "hashtags"}>
              <p className="text-sm text-sky-600">{post.hashtags}</p>
            </ElementBox>
            <ElementBox active={(pending?.task as { target?: string })?.target === "cta"}>
              <button className="w-full rounded-lg bg-navy-900 py-2 text-sm font-semibold text-white">{post.cta}</button>
            </ElementBox>
          </div>
        </div>

        {/* Edit toolbar (appears when the client asked for a change you accepted) */}
        {pending && (
          <div className="mt-4 rounded-xl border-2 border-gold-300 bg-gold-50/60 p-3">
            <p className="text-sm font-semibold text-navy-900">✏️ {pending.task.instruction}</p>
            {pending.task.kind === "text-free" && (
              <div className="mt-2">
                <textarea value={editDraft} rows={2} onChange={(e) => setEditDraft(e.target.value)}
                  className="w-full resize-y rounded-lg border-2 border-beige-200 bg-white px-3 py-2 text-sm text-navy-900 focus:border-navy-400 focus:outline-none" />
                <button onClick={applyTextFree} className="mt-2 rounded-lg bg-navy-900 px-4 py-1.5 text-sm font-semibold text-white hover:bg-navy-800">Apply change</button>
              </div>
            )}
            {pending.task.kind === "text-pick" && (
              <div className="mt-2 space-y-2">
                {pending.task.options.map((o) => (
                  <button key={o.id} onClick={() => pickEditOption(o.correct, () => setPost((p) => ({ ...p, [(pending.task as { target: string }).target]: o.text }))) }
                    className="block w-full rounded-lg border-2 border-beige-200 bg-white px-3 py-2 text-left text-sm text-navy-800 hover:border-navy-400">
                    {o.text}
                  </button>
                ))}
              </div>
            )}
            {pending.task.kind === "visual" && (
              <div className="mt-2 flex flex-wrap gap-2">
                {pending.task.options.map((o) => (
                  <button key={o.id} onClick={() => pickEditOption(o.correct, () => setPost((p) => ({ ...p, background: o.bg })))}
                    className={cn("h-12 w-16 rounded-lg border-2 border-white shadow ring-1 ring-beige-200", BACKGROUNDS[o.bg].className)} title={BACKGROUNDS[o.bg].label} />
                ))}
              </div>
            )}
            {editNote && <p className="mt-2 text-xs text-amber-700">💡 {editNote}</p>}
          </div>
        )}
      </div>

      {/* RIGHT — WhatsApp */}
      <div className="flex flex-col overflow-hidden rounded-2xl border-2 border-beige-200 shadow-sm lg:h-[640px]">
        {/* header */}
        <div className="flex items-center gap-3 bg-[#075E54] px-4 py-2.5 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-bold">B</span>
          <div>
            <p className="text-sm font-semibold leading-tight">BloomCafé <span className="font-normal text-white/60">(client)</span></p>
            <p className="text-[11px] text-white/70">online</p>
          </div>
        </div>
        {/* satisfaction */}
        <div className="flex items-center gap-2 bg-[#128C7E] px-4 py-1.5 text-white">
          <span className="text-base">{satFace}</span>
          <span className="text-[11px] font-medium">Client mood</span>
          <div className="ml-1 h-2 flex-1 overflow-hidden rounded-full bg-white/25">
            <div className={cn("h-full rounded-full transition-all duration-500", satColor)} style={{ width: `${sat}%` }} />
          </div>
          <span className="w-8 text-right text-[11px] font-bold">{sat}</span>
        </div>

        {/* chat */}
        <div ref={chatRef} className="flex-1 space-y-2 overflow-auto bg-[#ECE5DD] p-3">
          {chat.map((m, i) => (
            <div key={i} className={cn("flex", m.from === "me" ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[80%] rounded-lg px-3 py-1.5 text-sm shadow-sm",
                m.from === "me" ? "bg-[#DCF8C6] text-navy-900" : "bg-white text-navy-900")}>
                {m.text}
                {m.from === "me" && <Check className="ml-1 inline h-3 w-3 text-sky-500" />}
              </div>
            </div>
          ))}
        </div>

        {/* response options */}
        <div className="border-t border-beige-200 bg-white p-3">
          {ended ? (
            <p className="text-center text-sm text-navy-400">Chat ended.</p>
          ) : pending ? (
            <p className="text-center text-sm text-navy-500">✏️ Make the change on the left, then we'll continue…</p>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-navy-400">How do you reply?</p>
              {beat.options.map((o) => (
                <button key={o.id} onClick={() => chooseOption(o)}
                  className="block w-full rounded-xl border-2 border-beige-200 bg-white px-3 py-2 text-left text-sm text-navy-800 transition-all hover:border-navy-400 hover:bg-navy-50">
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ElementBox({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return <div className={cn("rounded", active && "ring-2 ring-gold-400 ring-offset-1")}>{children}</div>;
}

function buildResult(game: Game, sat: number, marks: boolean[]): GameResult {
  const steps: StepResult[] = marks.map((ok, i) => ({
    stepId: BEATS[i]?.id ?? `beat-${i}`, kind: "decision", correct: ok, awarded: ok ? 10 : 0, max: 10, answer: ok,
  }));
  return {
    gameId: game.id, role: game.role, steps,
    awarded: steps.reduce((s, x) => s + x.awarded, 0),
    max: steps.reduce((s, x) => s + x.max, 0),
    percent: clamp(sat, 0, 100),
    interest: null, completedAt: new Date().toISOString(),
  };
}
