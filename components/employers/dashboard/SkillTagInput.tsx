"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface SkillTagInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  accent?: "emerald" | "navy";
}

/** Type a skill and press Enter (or comma) to add a chip. Backspace removes the last. */
export function SkillTagInput({ value, onChange, placeholder, accent = "navy" }: SkillTagInputProps) {
  const [draft, setDraft] = useState("");

  const chipClass =
    accent === "emerald"
      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
      : "bg-navy-50 border-navy-200 text-navy-700";

  function add(raw: string) {
    const skill = raw.trim();
    if (!skill) return;
    if (!value.some((v) => v.toLowerCase() === skill.toLowerCase())) {
      onChange([...value, skill]);
    }
    setDraft("");
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-beige-300 bg-white px-2.5 py-2 focus-within:border-gold-400 focus-within:ring-4 focus-within:ring-gold-500/15 transition-all">
      {value.map((skill) => (
        <span key={skill} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[12px] font-medium ${chipClass}`}>
          {skill}
          <button
            type="button"
            onClick={() => onChange(value.filter((v) => v !== skill))}
            className="hover:opacity-70"
            aria-label={`Remove ${skill}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add(draft);
          } else if (e.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={() => add(draft)}
        placeholder={value.length ? "" : placeholder}
        className="flex-1 min-w-[8rem] bg-transparent text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none py-0.5"
      />
    </div>
  );
}
