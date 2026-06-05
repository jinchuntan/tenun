"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, FolderGit2, Sparkles, Link2 } from "lucide-react";
import type { PortfolioEvidence } from "@/lib/portfolio-types";
import { emptyEvidence } from "@/lib/portfolio-types";
import { saveEvidence, getCareerWeaveEvidence, hasCareerWeaveData } from "@/lib/portfolio-store";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import type { Translations } from "@/lib/i18n";

interface Props {
  value: PortfolioEvidence[];
  onChange: (items: PortfolioEvidence[]) => void;
}

/**
 * Optional "Portfolio or project evidence" editor for the CV Generator. Lets
 * users add structured proof of work (title, link, role, tools, description,
 * outcome) — the reliable path for design/visual portfolios whose PDFs have no
 * extractable text. Items persist to localStorage so they survive a refresh and
 * can be reused. Also offers a one-click import from existing Career Weave data.
 */
export function PortfolioEvidenceInput({ value, onChange }: Props) {
  const { dict } = useLanguage();
  const [careerWeaveAvailable, setCareerWeaveAvailable] = useState(false);

  useEffect(() => {
    setCareerWeaveAvailable(hasCareerWeaveData());
  }, []);

  // Single commit point: lift state to the parent AND persist locally.
  function commit(next: PortfolioEvidence[]) {
    onChange(next);
    saveEvidence(next);
  }

  function addManual() {
    commit([...value, emptyEvidence()]);
  }

  function importCareerWeave() {
    const derived = getCareerWeaveEvidence();
    // Avoid duplicating an already-imported Career Weave item.
    const existingTitles = new Set(value.filter((v) => v.source === "career_weave").map((v) => v.title));
    const fresh = derived.filter((d) => !existingTitles.has(d.title));
    if (fresh.length) commit([...value, ...fresh]);
  }

  function update(id: string, patch: Partial<PortfolioEvidence>) {
    commit(value.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function remove(id: string) {
    commit(value.filter((item) => item.id !== id));
  }

  return (
    <div className="rounded-xl border border-beige-300 bg-beige-50/60 p-4 space-y-3">
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#4164b4]/10 flex items-center justify-center shrink-0">
          <FolderGit2 size={16} className="text-[#4164b4]" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-navy-900">{dict.portfolio.title}</p>
          <p className="text-xs text-navy-400 leading-relaxed">
            {dict.portfolio.subtitle}
          </p>
        </div>
      </div>

      {value.length > 0 && (
        <div className="space-y-3">
          {value.map((item, idx) => (
            <EvidenceCard
              key={item.id}
              item={item}
              index={idx}
              onUpdate={(patch) => update(item.id, patch)}
              onRemove={() => remove(item.id)}
              dict={dict}
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={addManual}
          className="inline-flex items-center gap-1.5 rounded-lg border border-beige-300 bg-white px-3 py-1.5 text-xs font-semibold text-navy-700 hover:border-navy-300 transition-colors"
        >
          <Plus size={14} aria-hidden="true" /> {dict.portfolio.addProject}
        </button>
        {careerWeaveAvailable && (
          <button
            type="button"
            onClick={importCareerWeave}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#d4a017]/40 bg-[#d4a017]/10 px-3 py-1.5 text-xs font-semibold text-[#a97d12] hover:bg-[#d4a017]/15 transition-colors"
          >
            <Sparkles size={14} aria-hidden="true" /> {dict.portfolio.useCareerWeave}
          </button>
        )}
      </div>
    </div>
  );
}

function EvidenceCard({
  item,
  index,
  onUpdate,
  onRemove,
  dict,
}: {
  item: PortfolioEvidence;
  index: number;
  onUpdate: (patch: Partial<PortfolioEvidence>) => void;
  onRemove: () => void;
  dict: Translations;
}) {
  const toolsValue = (item.tools ?? []).join(", ");

  return (
    <div className="rounded-lg border border-beige-300 bg-white p-3 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-navy-400">
          {dict.portfolio.projectN.replace("{n}", String(index + 1))}
          {item.source === "career_weave" && (
            <span className="rounded-full bg-[#d4a017]/15 text-[#a97d12] px-1.5 py-0.5 text-[10px] normal-case">
              {dict.portfolio.fromCareerWeave}
            </span>
          )}
          {item.source === "upload" && item.fileName && (
            <span className="rounded-full bg-navy-50 text-navy-500 px-1.5 py-0.5 text-[10px] normal-case truncate max-w-[140px]">
              {item.fileName}
            </span>
          )}
        </span>
        <button
          type="button"
          onClick={onRemove}
          aria-label={dict.portfolio.removeProject.replace("{n}", String(index + 1))}
          className="text-navy-300 hover:text-red-500 transition-colors shrink-0"
        >
          <Trash2 size={15} aria-hidden="true" />
        </button>
      </div>

      <Field label={dict.portfolio.projectTitle}>
        <input
          type="text"
          value={item.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder={dict.portfolio.projectTitlePlaceholder}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <Field label={dict.portfolio.role}>
          <input
            type="text"
            value={item.role ?? ""}
            onChange={(e) => onUpdate({ role: e.target.value })}
            placeholder={dict.portfolio.rolePlaceholder}
            className={inputClass}
          />
        </Field>
        <Field label={dict.portfolio.tools}>
          <input
            type="text"
            value={toolsValue}
            onChange={(e) =>
              onUpdate({ tools: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })
            }
            placeholder={dict.portfolio.toolsPlaceholder}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label={dict.portfolio.link}>
        <div className="relative">
          <Link2 size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-navy-300" aria-hidden="true" />
          <input
            type="url"
            value={item.url ?? ""}
            onChange={(e) => onUpdate({ url: e.target.value })}
            placeholder="https://"
            className={`${inputClass} pl-7`}
          />
        </div>
      </Field>

      <Field label={dict.portfolio.description}>
        <textarea
          value={item.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          rows={2}
          placeholder={dict.portfolio.descriptionPlaceholder}
          className={`${inputClass} resize-y`}
        />
      </Field>

      <Field label={dict.portfolio.outcome}>
        <input
          type="text"
          value={item.outcome ?? ""}
          onChange={(e) => onUpdate({ outcome: e.target.value })}
          placeholder={dict.portfolio.outcomePlaceholder}
          className={inputClass}
        />
      </Field>
    </div>
  );
}

const inputClass =
  "w-full px-2.5 py-2 rounded-md border border-beige-300 bg-white text-xs text-navy-900 placeholder:text-navy-300 focus:outline-none focus:border-navy-400 focus:ring-2 focus:ring-[#d4a017]/15 transition-all";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-medium text-navy-500 mb-1">{label}</span>
      {children}
    </label>
  );
}
