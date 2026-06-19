"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Files, Search, GitBranch, Play, Blocks, Terminal as TerminalIcon,
  AlertCircle, AlertTriangle, Lightbulb, Check, CircleDot, GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/store/hooks";
import { completeGame } from "@/store/slices/simulatorSlice";
import { checkAnswer } from "@/lib/simulator/engine";
import { highlightLine } from "@/lib/simulator/highlight";
import {
  WF_FILES, WF_ISSUES, IMPLEMENT_IDS, EDGE_IDS, DEBUG_IDS, REVIEW_IDS,
  TICKET, TEST_FAIL_OUTPUT, TEST_PASS_OUTPUT, DIFF_OUTPUT, REVIEW_COMMENT,
  COMMIT_CHECK, PR_TITLE_CHECK, PR_BODY_CHECK,
} from "@/lib/simulator/games/swe-workflow";
import type { Game, StepResult, GameResult } from "@/lib/simulator/types";

type StageId =
  // Guided practice cycle (first bug → small commit → push)
  | "p_intro" | "p_branch" | "p_fix" | "p_add" | "p_commit" | "p_push"
  // Main run (banner only)
  | "implement" | "testFail" | "fixEdge" | "testPass" | "reviewDiff"
  | "removeDebug" | "add" | "commit" | "push" | "pr" | "addressReview"
  | "commit2" | "push2" | "merge";

const STAGES: { id: StageId; phase: string; instr: string }[] = [
  { id: "p_intro", phase: "Start", instr: "Read your ticket, then start working." },
  { id: "p_branch", phase: "Branch", instr: "Create your branch: git checkout -b <name>" },
  { id: "p_fix", phase: "Code", instr: "Fix the first bug — click the underlined line." },
  { id: "p_add", phase: "Commit", instr: "Stage your change: git add ." },
  { id: "p_commit", phase: "Commit", instr: 'Commit it: git commit -m "..."' },
  { id: "p_push", phase: "Push", instr: "Push your first change: git push -u origin <branch>" },
  { id: "implement", phase: "Code", instr: "Now fix the 3 remaining bugs (see Problems)." },
  { id: "testFail", phase: "Test", instr: "Run the tests: pytest" },
  { id: "fixEdge", phase: "Test", instr: "A test failed — fix the bug it caught." },
  { id: "testPass", phase: "Test", instr: "Run the tests again: pytest" },
  { id: "reviewDiff", phase: "Review", instr: "Review your changes: git diff" },
  { id: "removeDebug", phase: "Review", instr: "Remove the leftover debug line." },
  { id: "add", phase: "Commit", instr: "Stage your changes: git add ." },
  { id: "commit", phase: "Commit", instr: 'Commit with a clear message: git commit -m "..."' },
  { id: "push", phase: "Push", instr: "Push your branch: git push" },
  { id: "pr", phase: "PR", instr: "Open the pull request (right panel)." },
  { id: "addressReview", phase: "PR", instr: "A reviewer requested a change — address it." },
  { id: "commit2", phase: "PR", instr: 'Commit the fix: git commit -am "..."' },
  { id: "push2", phase: "PR", instr: "Push again: git push" },
  { id: "merge", phase: "Merge", instr: "All checks green — Squash & merge the PR." },
];
const PHASES = ["Branch", "Code", "Test", "Review", "Commit", "Push", "PR", "Merge"];
const idx = (id: StageId) => STAGES.findIndex((s) => s.id === id);

type Tone = "cmd" | "out" | "err" | "ok" | "sys";
interface TermLine { text: string; tone: Tone }

const fileName = (p: string) => p.split("/").pop()!;
const lineFileMap = new Map<string, string>();
WF_FILES.forEach((f) => f.lines.forEach((l) => lineFileMap.set(l.id, f.path)));
const activeIdsFor = (id: StageId): string[] =>
  id === "p_fix" ? ["i_discount"]
  : id === "implement" ? ["i_round", "i_coupon", "i_age"]
  : id === "fixEdge" ? EDGE_IDS
  : id === "removeDebug" ? DEBUG_IDS
  : id === "addressReview" ? REVIEW_IDS
  : [];

// Coachmark content for the guided practice cycle.
type TourTarget = "intro" | "terminal" | "editor";
const TOUR: Partial<Record<StageId, { target: TourTarget; title: string; body: string; example?: string }>> = {
  p_intro: { target: "intro", title: "Welcome to the IDE 👋", body: "This is ticket TENUN-482. You'll fix it like a real engineer — branch, fix, commit, push, PR, merge. Let's walk the first bug together, then you're on your own." },
  p_branch: { target: "terminal", title: "1 · Make a branch", body: "Never code on main. Open a branch for this ticket — type it in the terminal:", example: "git checkout -b fix/checkout-pricing" },
  p_fix: { target: "editor", title: "2 · Fix the bug", body: "The underlined line adds the discount instead of subtracting it. Click it, correct the code, then Commit fix." },
  p_add: { target: "terminal", title: "3 · Stage it", body: "Tell git which changes to include in the next commit:", example: "git add ." },
  p_commit: { target: "terminal", title: "4 · Commit it", body: "Save a snapshot with a message — what changed & why, referencing the ticket:", example: 'git commit -m "Fix member discount (TENUN-482)"' },
  p_push: { target: "terminal", title: "5 · Push it", body: "Upload your branch to GitHub:", example: "git push -u origin fix/checkout-pricing" },
};

export function SwePlayer({ game }: { game: Game }) {
  const dispatch = useAppDispatch();
  const [stageIdx, setStageIdx] = useState(0);
  const stage = STAGES[stageIdx];

  const [lineText, setLineText] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    WF_FILES.forEach((f) => f.lines.forEach((l) => (m[l.id] = l.text)));
    return m;
  });
  const [resolved, setResolved] = useState<string[]>([]);
  const [activeFile, setActiveFile] = useState(WF_FILES[0].path);
  const [editing, setEditing] = useState<{ issueId: string; draft: string } | null>(null);
  const [editorError, setEditorError] = useState<string | null>(null);

  const [term, setTerm] = useState<TermLine[]>([{ text: "Welcome — follow the tutorial to fix your first bug.", tone: "sys" }]);
  const [input, setInput] = useState("");
  const [branchName, setBranchName] = useState("main");
  const [bottomTab, setBottomTab] = useState<"terminal" | "problems">("terminal");

  const [prTitle, setPrTitle] = useState("");
  const [prBody, setPrBody] = useState("");
  const [prError, setPrError] = useState<string | null>(null);
  const [prCreated, setPrCreated] = useState(false);

  const [marks, setMarks] = useState<Record<string, boolean>>({});
  const [showHandoff, setShowHandoff] = useState(false);
  const termRef = useRef<HTMLDivElement>(null);

  useEffect(() => { termRef.current?.scrollTo({ top: termRef.current.scrollHeight }); }, [term]);

  const file = WF_FILES.find((f) => f.path === activeFile)!;
  const activeIds = activeIdsFor(stage.id);
  const tour = TOUR[stage.id] ?? null;
  const issueByLine = useMemo(() => {
    const m = new Map<string, string>();
    Object.values(WF_ISSUES).forEach((i) => m.set(i.lineId, i.id));
    return m;
  }, []);

  function push(...lines: TermLine[]) { setTerm((t) => [...t, ...lines]); }
  function out(lines: string[], tone: Tone = "out") { push(...lines.map((text) => ({ text, tone }))); }

  function enterStage(i: number) {
    const s = STAGES[i];
    setStageIdx(i);
    push({ text: `▸ ${s.instr}`, tone: "sys" });
    const ids = activeIdsFor(s.id);
    if (ids.length) {
      setActiveFile(lineFileMap.get(WF_ISSUES[ids[0]].lineId)!);
      setBottomTab("problems");
    } else if (s.id !== "pr" && s.id !== "merge") {
      setBottomTab("terminal");
    }
    if (s.id === "implement") setShowHandoff(true);
    if (s.id === "addressReview") push({ text: `💬 @${REVIEW_COMMENT.author} requested changes on your PR.`, tone: "sys" });
  }

  function maybeAdvanceEditor(nextResolved: string[]) {
    if (!activeIds.length) return;
    if (activeIds.every((id) => nextResolved.includes(id))) {
      if (stage.id === "implement") setMarks((m) => ({ ...m, implemented: true }));
      if (stage.id === "fixEdge") setMarks((m) => ({ ...m, edgeFixed: true }));
      if (stage.id === "removeDebug") setMarks((m) => ({ ...m, debugRemoved: true }));
      if (stage.id === "addressReview") setMarks((m) => ({ ...m, reviewFixed: true }));
      push({ text: "✓ Fixed. " + STAGES[stageIdx + 1].instr, tone: "ok" });
      enterStage(stageIdx + 1);
    }
  }

  function clickLine(lineId: string) {
    const issueId = issueByLine.get(lineId);
    if (!issueId || resolved.includes(issueId) || !activeIds.includes(issueId)) return;
    setEditing({ issueId, draft: lineText[lineId] });
    setEditorError(null);
  }
  function resolveIssue(issueId: string, newText: string) {
    const issue = WF_ISSUES[issueId];
    const next = [...resolved, issueId];
    setLineText((m) => ({ ...m, [issue.lineId]: newText }));
    setResolved(next);
    setEditing(null);
    setEditorError(null);
    maybeAdvanceEditor(next);
  }
  function commitFix() {
    if (!editing) return;
    const issue = WF_ISSUES[editing.issueId];
    if (issue.removal) return resolveIssue(issue.id, "");
    if (checkAnswer(editing.draft, issue.check!)) resolveIssue(issue.id, issue.fixedText);
    else setEditorError(issue.hint);
  }

  function skipTutorial() {
    setBranchName("fix/checkout-pricing");
    setLineText((m) => ({ ...m, [WF_ISSUES.i_discount.lineId]: WF_ISSUES.i_discount.fixedText }));
    setResolved((r) => (r.includes("i_discount") ? r : [...r, "i_discount"]));
    setMarks((m) => ({ ...m, branchGood: true }));
    const i = idx("implement");
    setStageIdx(i);
    setActiveFile(lineFileMap.get(WF_ISSUES.i_round.lineId)!);
    setBottomTab("problems");
    push({ text: `(tutorial skipped) ▸ ${STAGES[i].instr}`, tone: "sys" });
  }

  function runCommand(raw: string) {
    const cmd = raw.trim();
    if (!cmd) return;
    push({ text: `${prompt()} ${cmd}`, tone: "cmd" });
    const id = stage.id;

    const gitBranch = cmd.match(/^git\s+checkout\s+-b\s+(\S+)\s*$/);
    const isTest = /^(pytest|python -m pytest|py\.test|npm (run )?test|yarn test)\b/.test(cmd);
    const gitDiff = /^git\s+(diff|status)\b/.test(cmd);
    const gitAdd = /^git\s+add\s+(\.|-a|--all|-u|-A)/.test(cmd);
    const gitCommit = cmd.match(/^git\s+commit\s+(-a?m)\s+(['"])([\s\S]*?)\2/);
    const gitPush = /^git\s+push\b/.test(cmd);
    const ghMerge = /^gh\s+pr\s+merge/.test(cmd);

    if (id === "p_branch") {
      if (gitBranch) {
        const name = gitBranch[1];
        const conv = /^(fix|feat|feature|bug|chore)\/[a-z0-9._-]+$/i.test(name);
        const relevant = /(discount|checkout|pricing|coupon|482)/i.test(name);
        setBranchName(name);
        setMarks((m) => ({ ...m, branchGood: conv && relevant }));
        out([`Switched to a new branch '${name}'`], "ok");
        if (!conv) push({ text: "ⓘ Tip: teams usually name branches like fix/checkout-pricing.", tone: "sys" });
        return enterStage(stageIdx + 1);
      }
      return notYet(cmd);
    }
    if (id === "testFail") { if (isTest) { out(TEST_FAIL_OUTPUT, "err"); return enterStage(stageIdx + 1); } return notYet(cmd); }
    if (id === "testPass") { if (isTest) { out(TEST_PASS_OUTPUT, "ok"); return enterStage(stageIdx + 1); } return notYet(cmd); }
    if (id === "reviewDiff") { if (gitDiff) { out(DIFF_OUTPUT); return enterStage(stageIdx + 1); } return notYet(cmd); }

    if (id === "p_add" || id === "add") {
      if (gitAdd) { push({ text: "✓ Changes staged.", tone: "ok" }); return enterStage(stageIdx + 1); }
      if (/^git\s+add\s*$/.test(cmd)) return err("Nothing specified, nothing added. Try: git add .");
      return notYet(cmd);
    }
    if (id === "p_commit" || id === "commit" || id === "commit2") {
      if (gitCommit) {
        const msg = gitCommit[3].trim();
        if (!msg) return err("Aborting commit due to empty commit message.");
        const ok = id === "commit2" ? msg.length > 4 : checkAnswer(msg, COMMIT_CHECK);
        if (!ok) return err("That message is too vague. Say what changed and why, and reference TENUN-482.");
        if (id === "commit") setMarks((m) => ({ ...m, commitGood: true }));
        out([`[${branchName} 9f3a1c2] ${msg}`, " files changed"], "ok");
        return enterStage(stageIdx + 1);
      }
      if (/^git\s+commit\b/.test(cmd)) return err('Use a message: git commit -m "your message"');
      return notYet(cmd);
    }
    if (id === "p_push" || id === "push" || id === "push2") {
      if (gitPush) {
        if (id === "push") setMarks((m) => ({ ...m, pushed: true }));
        out(["Enumerating objects: 9, done.", "Writing objects: 100% (5/5), done.", `   3a1c2..9f3a1c2  ${branchName} -> ${branchName}`], "ok");
        if (id === "push2") push({ text: "✓ CI re-run… all checks passed.", tone: "ok" });
        return enterStage(stageIdx + 1);
      }
      return notYet(cmd);
    }
    if (id === "merge") { if (ghMerge) return doMerge(); return notYet(cmd); }
    return notYet(cmd);
  }

  function prompt() { return `~/tenun/checkout (${branchName}) $`; }
  function err(msg: string) { push({ text: msg, tone: "err" }); }
  function notYet(cmd: string) {
    const tok = cmd.split(/\s+/)[0];
    if (!["git", "pytest", "npm", "yarn", "gh", "python"].includes(tok)) err(`command not found: ${tok}`);
    else if (tok === "git" && !/^git\s+(checkout|add|commit|push|diff|status|pull|rebase|branch|merge)\b/.test(cmd))
      err(`git: '${cmd.split(/\s+/)[1] ?? ""}' is not a git command. See 'git --help'.`);
    else push({ text: `⤷ Not the step right now — ${stage.instr}`, tone: "sys" });
  }

  function submitPr() {
    if (!checkAnswer(prTitle, PR_TITLE_CHECK)) return setPrError("Give the PR a clear, specific title.");
    if (!checkAnswer(prBody, PR_BODY_CHECK)) return setPrError("Describe what you changed and that tests pass.");
    setMarks((m) => ({ ...m, prGood: true }));
    setPrCreated(true);
    setPrError(null);
    push({ text: `✓ Pull request opened: ${prTitle}`, tone: "ok" }, { text: "Running CI checks… ✓ build ✓ tests", tone: "ok" });
    enterStage(stageIdx + 1);
  }
  function doMerge() {
    push({ text: "✓ Squashed and merged into main. 🎉", tone: "ok" });
    dispatch(completeGame(buildResult(game, { ...marks, merged: true }, resolved)));
  }

  const remaining = activeIds.filter((id) => !resolved.includes(id));

  return (
    <div className="relative flex flex-col overflow-hidden rounded-xl border border-black/40 bg-[#1e1e1e] font-sans text-[13px] text-[#cccccc] shadow-2xl lg:h-[720px]">
      {/* Title bar */}
      <div className="flex h-9 shrink-0 items-center justify-between bg-[#323233] px-3">
        <div className="flex items-center gap-2 text-xs text-[#cccccc]/80">
          <span className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f56]" /><span className="h-3 w-3 rounded-full bg-[#ffbd2e]" /><span className="h-3 w-3 rounded-full bg-[#27c93f]" />
          </span>
          <span className="ml-2 hidden sm:inline">{TICKET.key} {TICKET.title} — Tenun IDE</span>
        </div>
        <span className="font-mono text-[11px] text-[#cccccc]/60">{branchName}</span>
      </div>

      {/* Instruction banner */}
      <div className="flex shrink-0 items-center gap-2 bg-[#37352a] px-4 py-1.5 text-xs text-[#e8d9a8]">
        <span className="rounded bg-[#cca700] px-1.5 py-0.5 text-[10px] font-bold text-black">{stageIdx + 1}/{STAGES.length}</span>
        <span className="font-medium">{stage.phase}</span><span className="text-[#cccccc]/40">·</span>
        <span className="truncate">{stage.instr}</span>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Activity bar */}
        <div className="hidden w-12 shrink-0 flex-col items-center gap-4 border-r border-black/30 bg-[#333333] py-3 text-[#858585] md:flex">
          <Files className="h-6 w-6 border-l-2 border-white pl-0.5 text-white" /><Search className="h-6 w-6" /><GitBranch className="h-6 w-6" /><Play className="h-6 w-6" /><Blocks className="h-6 w-6" />
        </div>

        {/* Explorer */}
        <div className="hidden w-44 shrink-0 flex-col border-r border-black/30 bg-[#252526] md:flex">
          <p className="px-4 py-2 text-[11px] uppercase tracking-wider text-[#858585]">Explorer</p>
          <div className="px-2 text-[13px]">
            <p className="px-1 py-0.5 font-semibold text-[#cccccc]">⌄ CHECKOUT</p>
            {WF_FILES.map((f) => (
              <button key={f.path} onClick={() => setActiveFile(f.path)}
                className={cn("flex w-full items-center gap-2 rounded px-2 py-1 pl-5 text-left", f.path === activeFile ? "bg-[#37373d] text-white" : "text-[#cccccc]/80 hover:bg-[#2a2d2e]")}>
                <span className="text-[#519aba]">{"</>"}</span><span className="truncate">{fileName(f.path)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Editor column */}
        <div className={cn("flex min-w-0 flex-1 flex-col", tour?.target === "editor" && "ring-2 ring-inset ring-[#cca700]")}>
          <div className="flex h-9 shrink-0 items-stretch bg-[#252526]">
            {WF_FILES.map((f) => (
              <button key={f.path} onClick={() => setActiveFile(f.path)}
                className={cn("flex items-center gap-2 border-r border-black/30 px-3 text-[13px]", f.path === activeFile ? "bg-[#1e1e1e] text-white" : "bg-[#2d2d2d] text-[#cccccc]/70")}>
                <span className="text-[#519aba]">{"</>"}</span>{fileName(f.path)}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto bg-[#1e1e1e] font-mono text-[13px] leading-[22px]">
            {file.lines.map((line, i) => {
              const issueId = issueByLine.get(line.id);
              const done = issueId && resolved.includes(issueId);
              const open = issueId && activeIds.includes(issueId) && !done;
              const isEditing = editing?.issueId === issueId;
              const sev = issueId ? WF_ISSUES[issueId].severity : "warning";
              const text = lineText[line.id];
              const squiggle = open ? (sev === "error"
                ? "underline decoration-wavy decoration-2 decoration-[#f14c4c] underline-offset-4"
                : "underline decoration-wavy decoration-2 decoration-[#cca700] underline-offset-4") : "";
              return (
                <div key={line.id} id={`line-${line.id}`}>
                  <div onClick={() => clickLine(line.id)} className={cn("group flex items-start hover:bg-[#2a2d2e]", open && "cursor-pointer", done && "bg-[#1d3a1d]/40")}>
                    <span className="w-10 shrink-0 select-none py-px pr-3 text-right text-[#858585]">{i + 1}</span>
                    <span className="w-5 shrink-0 select-none py-px text-center">
                      {done ? <span className="text-[#2ea043]">+</span> : open ? <Lightbulb className="mx-auto h-3.5 w-3.5 text-[#cca700]" /> : null}
                    </span>
                    <code className={cn("whitespace-pre-wrap break-words py-px pr-4", squiggle)}>
                      {highlightLine(text).map((t, k) => <span key={k} className={t.cls}>{t.text}</span>)}
                    </code>
                  </div>
                  {isEditing && issueId && (
                    <div className="ml-10 mr-4 my-1 rounded border border-[#454545] bg-[#252526] p-3">
                      <p className="mb-1.5 flex items-center gap-1.5 text-[12px] text-[#cccccc]"><Lightbulb className="h-3.5 w-3.5 text-[#cca700]" /> Quick Fix · {WF_ISSUES[issueId].title}</p>
                      <p className="mb-2 text-[11px] text-[#858585]">{WF_ISSUES[issueId].concern}</p>
                      {WF_ISSUES[issueId].removal ? (
                        <button onClick={commitFix} className="rounded bg-[#a1260d] px-2.5 py-1 text-[12px] font-medium text-white hover:bg-[#c4341a]">Remove line</button>
                      ) : (
                        <>
                          <textarea value={editing!.draft} spellCheck={false} rows={1}
                            onChange={(e) => setEditing((s) => (s ? { ...s, draft: e.target.value } : s))}
                            className="w-full resize-y rounded border border-[#3c3c3c] bg-[#3c3c3c] px-2 py-1 font-mono text-[13px] text-[#d4d4d4] focus:border-[#007acc] focus:outline-none" />
                          {editorError && <p className="mt-1.5 text-[11px] text-[#cca700]">💡 {editorError}</p>}
                          <div className="mt-2 flex gap-2">
                            <button onClick={commitFix} className="rounded bg-[#0e639c] px-2.5 py-1 text-[12px] font-medium text-white hover:bg-[#1177bb]">Commit fix</button>
                            <button onClick={() => { setEditing(null); setEditorError(null); }} className="rounded px-2.5 py-1 text-[12px] text-[#cccccc]/70 hover:bg-[#2a2d2e]">Cancel</button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom panel */}
          <div className={cn("flex h-52 shrink-0 flex-col border-t border-black/40 bg-[#1e1e1e]", tour?.target === "terminal" && "ring-2 ring-inset ring-[#cca700]")}>
            <div className="flex items-center gap-3 bg-[#252526] px-4 py-1.5 text-[11px] uppercase tracking-wider">
              <button onClick={() => setBottomTab("terminal")} className={cn("flex items-center gap-1 pb-1", bottomTab === "terminal" ? "border-b-2 border-[#007acc] text-white" : "text-[#858585]")}><TerminalIcon className="h-3.5 w-3.5" /> Terminal</button>
              <button onClick={() => setBottomTab("problems")} className={cn("flex items-center gap-1 pb-1", bottomTab === "problems" ? "border-b-2 border-[#007acc] text-white" : "text-[#858585]")}>Problems {remaining.length > 0 && <span className="rounded-full bg-[#4d4d4d] px-1.5 text-[10px]">{remaining.length}</span>}</button>
            </div>
            {bottomTab === "terminal" ? (
              <div className="flex flex-1 flex-col overflow-hidden">
                <div ref={termRef} className="flex-1 overflow-auto px-3 py-2 font-mono text-[12.5px] leading-5">
                  {term.map((l, i) => (
                    <p key={i} className={cn("whitespace-pre-wrap break-words",
                      l.tone === "cmd" && "text-[#d4d4d4]", l.tone === "out" && "text-[#a0a0a0]", l.tone === "err" && "text-[#f14c4c]", l.tone === "ok" && "text-[#4ec9b0]", l.tone === "sys" && "text-[#cca700]")}>{l.text}</p>
                  ))}
                </div>
                <div className="flex items-center gap-2 border-t border-black/30 px-3 py-1.5 font-mono text-[12.5px]">
                  <span className="text-[#4ec9b0]">{prompt()}</span>
                  <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { runCommand(input); setInput(""); } }} spellCheck={false} autoFocus placeholder="type a command…" className="flex-1 bg-transparent text-[#d4d4d4] placeholder:text-[#555] focus:outline-none" />
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-auto py-1">
                {activeIds.length === 0 && <p className="px-4 py-2 text-[12px] text-[#858585]">No problems for this step.</p>}
                {activeIds.map((id) => {
                  const iss = WF_ISSUES[id]; const done = resolved.includes(id);
                  return (
                    <button key={id} onClick={() => { setActiveFile(lineFileMap.get(iss.lineId)!); clickLine(iss.lineId); }}
                      className={cn("flex w-full items-start gap-2 px-4 py-1 text-left text-[13px] hover:bg-[#2a2d2e]", done && "opacity-45")}>
                      {done ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2ea043]" /> : iss.severity === "error" ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#f14c4c]" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#cca700]" />}
                      <span className={cn("text-[#cccccc]", done && "line-through")}>{iss.title}</span>
                      <span className="ml-auto shrink-0 font-mono text-[11px] text-[#858585]">{fileName(lineFileMap.get(iss.lineId)!)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Context panel */}
        <div className="hidden w-72 shrink-0 flex-col overflow-auto border-l border-black/30 bg-[#252526] p-3 lg:flex">
          <ContextPanel stageId={stage.id} prCreated={prCreated} prTitle={prTitle} setPrTitle={setPrTitle} prBody={prBody} setPrBody={setPrBody} prError={prError} onSubmitPr={submitPr} onMerge={doMerge} />
          <div className="mt-4 border-t border-black/30 pt-3">
            <p className="mb-2 text-[10px] uppercase tracking-widest text-[#858585]">Workflow</p>
            <div className="flex flex-wrap gap-1">
              {PHASES.map((p) => {
                const cur = p === stage.phase;
                const passed = PHASES.indexOf(p) < PHASES.indexOf(stage.phase);
                return <span key={p} className={cn("flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px]", cur ? "bg-[#094771] text-white" : passed ? "text-[#4ec9b0]" : "text-[#858585]")}>{passed ? <Check className="h-3 w-3" /> : <CircleDot className="h-3 w-3" />}{p}</span>;
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex h-6 shrink-0 items-center justify-between bg-[#007acc] px-3 text-[11px] text-white">
        <span className="flex items-center gap-1"><GitBranch className="h-3.5 w-3.5" /> {branchName}</span>
        <span className="hidden gap-3 sm:flex"><span>Python</span><span>Spaces: 4</span><span>UTF-8</span></span>
      </div>

      {/* ── Guided tour overlays ── */}
      {tour && tour.target === "intro" && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#454545] bg-[#252526] p-6 text-center shadow-2xl">
            <GraduationCap className="mx-auto h-9 w-9 text-[#cca700]" />
            <h3 className="mt-3 text-lg font-semibold text-white">{tour.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#cccccc]/80">{tour.body}</p>
            <button onClick={() => enterStage(idx("p_branch"))} className="mt-5 rounded-lg bg-[#2ea043] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2c974b]">Start working →</button>
          </div>
        </div>
      )}
      {tour && tour.target !== "intro" && (
        <div className={cn("absolute z-40 w-80", tour.target === "terminal" ? "bottom-16 left-1/2 -translate-x-1/2" : "left-1/2 top-28 -translate-x-1/2")}>
          <div className="rounded-xl border-2 border-[#cca700] bg-[#252526] p-4 shadow-2xl">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#cca700]">
              <GraduationCap className="h-3.5 w-3.5" /> Tutorial
            </div>
            <p className="mt-1 text-sm font-semibold text-white">{tour.title}</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-[#cccccc]/80">{tour.body}</p>
            {tour.example && (
              <pre className="mt-2 overflow-x-auto rounded bg-[#1e1e1e] px-2.5 py-1.5 font-mono text-[12px] text-[#4ec9b0]">{tour.example}</pre>
            )}
            <button onClick={skipTutorial} className="mt-2 text-[11px] text-[#858585] hover:text-[#cccccc] hover:underline">Skip tutorial →</button>
          </div>
        </div>
      )}

      {/* Handoff modal between practice and main run */}
      {showHandoff && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#454545] bg-[#252526] p-6 text-center shadow-2xl">
            <p className="text-3xl">🎉</p>
            <h3 className="mt-2 text-lg font-semibold text-white">That&apos;s one full cycle!</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#cccccc]/80">
              You just branched, fixed a bug, committed, and pushed. Now finish the ticket on your own — 3 more bugs, the tests, a PR, the reviewer&apos;s feedback, and the merge. The <span className="text-[#e8d9a8]">banner up top</span> tells you each step.
            </p>
            <button onClick={() => setShowHandoff(false)} className="mt-5 rounded-lg bg-[#0e639c] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1177bb]">Let&apos;s go →</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ContextPanel({
  stageId, prCreated, prTitle, setPrTitle, prBody, setPrBody, prError, onSubmitPr, onMerge,
}: {
  stageId: StageId; prCreated: boolean;
  prTitle: string; setPrTitle: (v: string) => void; prBody: string; setPrBody: (v: string) => void;
  prError: string | null; onSubmitPr: () => void; onMerge: () => void;
}) {
  return (
    <div className="space-y-3 text-[12px]">
      <div className="rounded-lg border border-black/30 bg-[#1e1e1e] p-3">
        <div className="flex items-center gap-2"><span className="rounded bg-[#a1260d] px-1.5 py-0.5 text-[10px] font-bold text-white">BUG</span><span className="font-mono text-[11px] text-[#858585]">{TICKET.key}</span></div>
        <p className="mt-1.5 font-semibold text-[#cccccc]">{TICKET.title}</p>
        <p className="mt-1 leading-relaxed text-[#a0a0a0]">{TICKET.description}</p>
        <p className="mt-2 text-[10px] uppercase tracking-wider text-[#858585]">Acceptance</p>
        <ul className="mt-1 space-y-0.5">{TICKET.acceptance.map((a) => <li key={a} className="flex gap-1.5 text-[#a0a0a0]"><span className="text-[#4ec9b0]">✓</span>{a}</li>)}</ul>
      </div>

      {stageId === "pr" && !prCreated && (
        <div className="rounded-lg border border-black/30 bg-[#1e1e1e] p-3">
          <p className="mb-2 font-semibold text-[#cccccc]">Open a pull request</p>
          <input value={prTitle} onChange={(e) => setPrTitle(e.target.value)} placeholder="PR title" className="mb-2 w-full rounded border border-[#3c3c3c] bg-[#3c3c3c] px-2 py-1 text-[#d4d4d4] focus:border-[#007acc] focus:outline-none" />
          <textarea value={prBody} onChange={(e) => setPrBody(e.target.value)} rows={4} placeholder="What changed, and how you tested it…" className="w-full resize-y rounded border border-[#3c3c3c] bg-[#3c3c3c] px-2 py-1 text-[#d4d4d4] focus:border-[#007acc] focus:outline-none" />
          {prError && <p className="mt-1.5 text-[11px] text-[#cca700]">💡 {prError}</p>}
          <button onClick={onSubmitPr} className="mt-2 w-full rounded bg-[#2ea043] py-1.5 font-semibold text-white hover:bg-[#2c974b]">Create pull request</button>
        </div>
      )}
      {prCreated && (
        <div className="rounded-lg border border-black/30 bg-[#1e1e1e] p-3">
          <p className="font-semibold text-[#cccccc]">{prTitle || "Pull request"}</p>
          <p className="mt-1 text-[11px] text-[#4ec9b0]">✓ build · ✓ tests</p>
          {(stageId === "addressReview" || stageId === "commit2" || stageId === "push2") && (
            <div className="mt-2 rounded border border-[#cca700]/40 bg-[#cca700]/10 p-2">
              <p className="text-[11px] font-semibold text-[#cca700]">Changes requested · @{REVIEW_COMMENT.author}</p>
              <p className="mt-1 text-[#a0a0a0]">{REVIEW_COMMENT.body}</p>
            </div>
          )}
          {stageId === "merge" && <button onClick={onMerge} className="mt-2 w-full rounded bg-[#8957e5] py-1.5 font-semibold text-white hover:bg-[#9a6cf0]">Squash & merge</button>}
        </div>
      )}
    </div>
  );
}

function buildResult(game: Game, marks: Record<string, boolean>, resolved: string[]): GameResult {
  const done = new Set(resolved);
  const milestones: { id: string; ok: boolean; pts: number }[] = [
    { id: "branch", ok: !!marks.branchGood, pts: 8 },
    ...IMPLEMENT_IDS.map((id) => ({ id, ok: done.has(id), pts: 8 })),
    { id: "edge", ok: done.has(EDGE_IDS[0]), pts: 12 },
    { id: "debug", ok: done.has(DEBUG_IDS[0]), pts: 8 },
    { id: "commit", ok: !!marks.commitGood, pts: 10 },
    { id: "pr", ok: !!marks.prGood, pts: 10 },
    { id: "review", ok: done.has(REVIEW_IDS[0]), pts: 10 },
    { id: "merge", ok: !!marks.merged, pts: 10 },
  ];
  const steps: StepResult[] = milestones.map((m) => ({ stepId: m.id, kind: "edit", correct: m.ok, awarded: m.ok ? m.pts : 0, max: m.pts, answer: m.ok }));
  const max = steps.reduce((s, x) => s + x.max, 0);
  const awarded = steps.reduce((s, x) => s + x.awarded, 0);
  return { gameId: game.id, role: game.role, steps, awarded, max, percent: max === 0 ? 0 : Math.round((awarded / max) * 100), interest: null, completedAt: new Date().toISOString() };
}
