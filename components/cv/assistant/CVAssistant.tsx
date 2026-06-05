"use client";

import { useState } from "react";
import { Sparkles, Plus, Check, X, AlertTriangle, Wand2, Send } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateBlockContent, replaceBlockContent, addBlockWithContent,
} from "@/store/slices/cvSlice";
import type { BlockType, CVBlock } from "@/lib/cv-types";
import { BLOCK_LABELS } from "@/lib/cv-types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type AssistantMode =
  | "generate_from_notes" | "improve_block" | "generate_bullets"
  | "refine_bullets" | "suggest_sections";

interface Chip {
  label: string;
  mode: AssistantMode;
  instruction?: string;
}

interface ApiSuggestion {
  type: "replace_block" | "append_bullets" | "add_block" | "update_field";
  blockType: BlockType;
  content: Record<string, string | string[]>;
  explanation: string;
}

interface CardState {
  key: string;
  suggestion: ApiSuggestion;
  fieldKey: string;
  isList: boolean;
  text: string;
}

const BULLET_TYPES: BlockType[] = ["work_experience", "achievements", "extracurricular"];

function chipsFor(type: BlockType): Chip[] {
  if (BULLET_TYPES.includes(type)) {
    return [
      { label: "Generate bullets", mode: "generate_bullets" },
      { label: "Improve bullets", mode: "refine_bullets", instruction: "stronger and more professional" },
      { label: "Make concise", mode: "refine_bullets", instruction: "more concise" },
      { label: "Tailor to role", mode: "refine_bullets", instruction: "tailored to the target role" },
    ];
  }
  if (type === "summary") {
    return [
      { label: "Improve summary", mode: "improve_block", instruction: "stronger and more professional" },
      { label: "Make concise", mode: "improve_block", instruction: "more concise" },
      { label: "Tailor to role", mode: "improve_block", instruction: "tailored to the target role" },
    ];
  }
  if (type === "skills") {
    return [{ label: "Suggest skills", mode: "improve_block", instruction: "suggest additional relevant skills from the notes and target role" }];
  }
  if (type === "portfolio") {
    return [{ label: "Improve description", mode: "improve_block", instruction: "clearer and more impactful" }];
  }
  if (type === "custom") {
    return [{ label: "Improve wording", mode: "improve_block", instruction: "stronger and more professional" }];
  }
  return [];
}

const DEFAULT_INSTRUCTION =
  "Use the user's rough notes to generate truthful, professional CV suggestions for this selected section.";

// Sensible default action for the free-form send (Enter / "Ask Tenun"),
// chosen from the active section type.
function defaultActionFor(block: CVBlock, hasNotes: boolean): { mode: AssistantMode; instruction: string } {
  if (BULLET_TYPES.includes(block.type)) {
    // With notes, draft new bullets from them; without, refine what's there.
    return { mode: hasNotes ? "generate_bullets" : "refine_bullets", instruction: DEFAULT_INSTRUCTION };
  }
  return { mode: "improve_block", instruction: DEFAULT_INSTRUCTION };
}

// Whether the section already has content worth improving (so the assistant
// can run even when the notes box is empty).
function blockHasContent(block: CVBlock): boolean {
  for (const k of ["bullets", "items"]) {
    const v = block.content[k];
    if (Array.isArray(v) && v.filter(Boolean).length > 0) return true;
  }
  for (const k of ["text", "description", "body", "summary", "heading"]) {
    const v = block.content[k];
    if (typeof v === "string" && v.trim()) return true;
  }
  return false;
}

function primaryField(content: Record<string, string | string[]>): { key: string; isList: boolean } | null {
  for (const k of ["bullets", "items", "text", "description", "body"]) {
    if (k in content) return { key: k, isList: k === "bullets" || k === "items" };
  }
  const keys = Object.keys(content);
  if (!keys.length) return null;
  return { key: keys[0], isList: Array.isArray(content[keys[0]]) };
}

function readLocale(): "en" | "ms" | "zh-CN" {
  try {
    const saved = window.localStorage.getItem("tenun-locale");
    if (saved === "ms") return "ms";
    if (saved === "zh-CN") return "zh-CN";
    return "en";
  } catch {
    return "en";
  }
}

let cardCounter = 0;

export function CVAssistant() {
  const dispatch = useAppDispatch();
  const { meta, blocks, ui } = useAppSelector((s) => s.cv);
  const activeBlock: CVBlock | null = ui.activeBlockId ? blocks.byId[ui.activeBlockId] ?? null : null;

  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [cards, setCards] = useState<CardState[]>([]);
  const [targetId, setTargetId] = useState<string | null>(null);

  const chips = activeBlock ? chipsFor(activeBlock.type) : [];
  const hasNotes = notes.trim().length > 0;
  const hasContent = activeBlock ? blockHasContent(activeBlock) : false;
  const canSend = !loading && !!activeBlock && (hasNotes || hasContent);

  async function run(action: { mode: AssistantMode; instruction?: string }) {
    // Guard prevents duplicate in-flight requests (Enter spam / double-click).
    if (!activeBlock || loading) return;
    setLoading(true);
    setError(null);
    setWarnings([]);
    setCards([]);
    setTargetId(activeBlock.id);
    try {
      const res = await fetch("/api/cv-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: action.mode,
          instruction: action.instruction,
          targetJob: meta.targetJob,
          format: meta.format,
          style: meta.style,
          notes,
          block: activeBlock,
          locale: readLocale(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "The assistant could not respond.");
      }
      const data = await res.json();
      const suggestions: ApiSuggestion[] = data.suggestions ?? [];
      setWarnings(data.warnings ?? []);
      const next: CardState[] = [];
      for (const s of suggestions) {
        const field = primaryField(s.content);
        if (!field) continue;
        const raw = s.content[field.key];
        next.push({
          key: `card-${cardCounter++}`,
          suggestion: s,
          fieldKey: field.key,
          isList: field.isList,
          text: field.isList ? (raw as string[]).join("\n") : (raw as string),
        });
      }
      if (!next.length) setError("No usable suggestions came back. Try adding a bit more detail in the notes.");
      setCards(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleSend() {
    if (!activeBlock || !canSend) return;
    run(defaultActionFor(activeBlock, hasNotes));
  }

  function valueFromCard(card: CardState): string | string[] {
    if (card.isList) {
      return card.text
        .split("\n")
        .map((l) => l.trim().replace(/^[-•*]\s*/, ""))
        .filter(Boolean);
    }
    return card.text.trim();
  }

  function applyCard(card: CardState) {
    const value = valueFromCard(card);
    const id = targetId;

    if (card.suggestion.type === "add_block") {
      dispatch(addBlockWithContent({
        type: card.suggestion.blockType,
        content: { ...card.suggestion.content, [card.fieldKey]: value },
      }));
    } else if (id) {
      if (card.suggestion.type === "append_bullets") {
        const existing = (blocks.byId[id]?.content.bullets as string[] | undefined) ?? [];
        dispatch(updateBlockContent({ id, key: "bullets", value: [...existing.filter(Boolean), ...(value as string[])] }));
      } else if (card.suggestion.type === "replace_block") {
        dispatch(replaceBlockContent({ id, content: { ...card.suggestion.content, [card.fieldKey]: value } }));
      } else {
        dispatch(updateBlockContent({ id, key: card.fieldKey, value }));
      }
    }
    setCards((prev) => prev.filter((c) => c.key !== card.key));
  }

  function applyAll() {
    // Apply in order; each apply reads the latest store state for appends.
    [...cards].forEach(applyCard);
  }

  function rejectCard(key: string) {
    setCards((prev) => prev.filter((c) => c.key !== key));
  }

  if (!activeBlock) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center mb-3">
          <Sparkles size={18} className="text-gold-500" />
        </div>
        <p className="text-xs font-medium text-gray-500">Select a section</p>
        <p className="text-[11px] text-gray-400 mt-1 max-w-[200px]">
          Pick a section on the left, then let Tenun draft or sharpen its content for you.
        </p>
      </div>
    );
  }

  const insertLabel = (card: CardState) =>
    card.suggestion.type === "append_bullets" ? "Insert bullets"
      : card.suggestion.type === "add_block" ? "Add section"
      : "Replace";

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      <div>
        <p className="text-xs font-semibold text-[#0a1628]">
          Tenun Assistant · {BLOCK_LABELS[activeBlock.type]}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5">
          Jot rough notes, then let Tenun turn them into strong, truthful content.
        </p>
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onKeyDown={(e) => {
          // Enter sends; Shift+Enter inserts a newline.
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        rows={3}
        placeholder={
          BULLET_TYPES.includes(activeBlock.type)
            ? "e.g. Built backend APIs, used Perforce, helped teammates ship features — or just say what you want"
            : "Tell Tenun what to do, e.g. “make this sound stronger”…"
        }
        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-[#0a1628] placeholder:text-gray-300 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-500/15 transition-all resize-none disabled:opacity-60"
        disabled={loading}
      />

      {/* Primary send action */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] text-gray-400">
          {canSend || loading ? "Enter to send · Shift+Enter for a new line" : "Add a few rough notes first."}
        </p>
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0a1628] text-white text-xs font-semibold hover:bg-[#1a2a4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {loading ? "Drafting…" : <><Send size={13} /> Ask Tenun</>}
        </button>
      </div>

      {chips.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <button
              key={chip.label}
              onClick={() => run(chip)}
              disabled={loading}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-beige-300 bg-white text-[11px] font-medium text-[#0a1628] hover:border-gold-400 hover:bg-gold-50 transition-all disabled:opacity-50"
            >
              <Wand2 size={11} className="text-gold-600" />
              {chip.label}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-gray-400 rounded-lg bg-gray-50 border border-gray-100 p-2.5">
          This section is best filled in the <span className="font-medium text-gray-500">Edit</span> tab. The assistant helps most with summaries, skills, and bullet-point sections.
        </p>
      )}

      {loading && (
        <LoadingSpinner
          size="sm"
          label="Tenun is drafting suggestions…"
          className="py-2"
          labelClassName="text-xs text-gray-500"
        />
      )}

      {error && (
        <p className="text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-lg p-2.5">{error}</p>
      )}

      {warnings.length > 0 && (
        <div className="flex items-start gap-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-2.5">
          <AlertTriangle size={12} className="mt-0.5 shrink-0" />
          <span>{warnings.join(" ")}</span>
        </div>
      )}

      {cards.length > 1 && (
        <button
          onClick={applyAll}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#0a1628] text-white text-xs font-semibold hover:bg-[#1a2a4a] transition-colors"
        >
          <Check size={13} /> Insert all suggestions
        </button>
      )}

      <div className="space-y-2.5">
        {cards.map((card) => (
          <div key={card.key} className="rounded-xl border border-beige-300 bg-beige-50/60 p-3 space-y-2">
            {card.suggestion.explanation && (
              <p className="text-[10px] text-gray-500 leading-snug">{card.suggestion.explanation}</p>
            )}
            <textarea
              value={card.text}
              onChange={(e) =>
                setCards((prev) => prev.map((c) => (c.key === card.key ? { ...c, text: e.target.value } : c)))
              }
              rows={card.isList ? Math.min(8, Math.max(3, card.text.split("\n").length)) : 4}
              className="w-full px-2.5 py-2 rounded-lg border border-gray-200 bg-white text-xs text-[#0a1628] focus:outline-none focus:border-gold-400 transition-colors resize-none leading-relaxed"
              aria-label="Edit suggestion before inserting"
            />
            {card.isList && (
              <p className="text-[10px] text-gray-400">One item per line — edit freely before inserting.</p>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={() => applyCard(card)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500 text-[#0a1628] text-xs font-semibold hover:bg-gold-400 transition-colors"
              >
                {card.suggestion.type === "add_block" ? <Plus size={12} /> : <Check size={12} />}
                {insertLabel(card)}
              </button>
              <button
                onClick={() => rejectCard(card.key)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs font-medium hover:border-gray-300 hover:text-gray-700 transition-colors"
              >
                <X size={12} /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
