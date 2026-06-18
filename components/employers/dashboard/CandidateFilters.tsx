"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, Check, ChevronDown, CheckCircle2 } from "lucide-react";

export interface CandidateFilterState {
  /** Only candidates who evidence every must-have skill of the active role. */
  meetsMustHaves: boolean;
  /** Selected intent signals (OR within the group). */
  status: string[];
  /** Selected readiness levels (OR within the group). */
  readiness: string[];
}

export interface FilterOption {
  value: string;
  /** How many candidates in the current view match this option. */
  count: number;
}

export const EMPTY_FILTERS: CandidateFilterState = {
  meetsMustHaves: false,
  status: [],
  readiness: [],
};

export function activeFilterCount(f: CandidateFilterState): number {
  return (f.meetsMustHaves ? 1 : 0) + f.status.length + f.readiness.length;
}

interface CandidateFiltersProps {
  value: CandidateFilterState;
  onChange: (next: CandidateFilterState) => void;
  mustHavesCount: number;
  statusOptions: FilterOption[];
  readinessOptions: FilterOption[];
}

export function CandidateFilters({
  value, onChange, mustHavesCount, statusOptions, readinessOptions,
}: CandidateFiltersProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = activeFilterCount(value);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function toggleArray(key: "status" | "readiness", v: string) {
    const cur = value[key];
    const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
    onChange({ ...value, [key]: next });
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={[
          "inline-flex items-center gap-2 h-full px-4 py-3.5 rounded-2xl border text-sm font-semibold transition-all shadow-sm",
          active > 0
            ? "border-gold-400 bg-gold-50 text-navy-900"
            : "border-beige-300 bg-white text-navy-700 hover:border-gold-300",
        ].join(" ")}
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filters
        {active > 0 && (
          <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-gold-500 text-navy-900 text-[11px] font-bold">
            {active}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 text-navy-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 z-20 mt-2 w-72 origin-top-right rounded-2xl border border-beige-300 bg-white p-3 shadow-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-navy-400">Filter candidates</p>
              {active > 0 && (
                <button
                  type="button"
                  onClick={() => onChange(EMPTY_FILTERS)}
                  className="text-[11px] font-semibold text-navy-500 hover:text-navy-900"
                >
                  Clear all
                </button>
              )}
            </div>

            <Group label="Fit">
              <OptionRow
                label="Meets all must-haves"
                count={mustHavesCount}
                checked={value.meetsMustHaves}
                onToggle={() => onChange({ ...value, meetsMustHaves: !value.meetsMustHaves })}
                icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              />
            </Group>

            {statusOptions.length > 0 && (
              <Group label="Status">
                {statusOptions.map((o) => (
                  <OptionRow
                    key={o.value}
                    label={o.value}
                    count={o.count}
                    checked={value.status.includes(o.value)}
                    onToggle={() => toggleArray("status", o.value)}
                  />
                ))}
              </Group>
            )}

            {readinessOptions.length > 0 && (
              <Group label="Readiness" last>
                {readinessOptions.map((o) => (
                  <OptionRow
                    key={o.value}
                    label={o.value}
                    count={o.count}
                    checked={value.readiness.includes(o.value)}
                    onToggle={() => toggleArray("readiness", o.value)}
                  />
                ))}
              </Group>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Group({ label, children, last = false }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={last ? "" : "mb-2 pb-2 border-b border-beige-200"}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-navy-300 px-1 mb-0.5">{label}</p>
      {children}
    </div>
  );
}

function OptionRow({
  label, count, checked, onToggle, icon,
}: {
  label: string;
  count: number;
  checked: boolean;
  onToggle: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className="w-full flex items-center gap-2.5 px-1.5 py-1.5 rounded-lg hover:bg-beige-50 transition-colors text-left"
    >
      <span
        className={[
          "flex items-center justify-center w-4 h-4 rounded-[5px] border transition-colors shrink-0",
          checked ? "bg-navy-900 border-navy-900 text-white" : "border-beige-300 bg-white",
        ].join(" ")}
      >
        {checked && <Check className="w-3 h-3" />}
      </span>
      <span className="flex-1 inline-flex items-center gap-1.5 text-[13px] font-medium text-navy-800">
        {icon}{label}
      </span>
      <span className="text-[11px] font-semibold text-navy-400 tabular-nums">{count}</span>
    </button>
  );
}
