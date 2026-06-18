"use client";

import { useMemo, useState } from "react";
import { Search, Star, X } from "lucide-react";
import { CandidateRow } from "./CandidateRow";
import { CandidateCVModal } from "./CandidateCVModal";
import {
  CandidateFilters, EMPTY_FILTERS, activeFilterCount, type CandidateFilterState,
} from "./CandidateFilters";
import { useEmployerWorkspace } from "./EmployerWorkspaceContext";
import { roleToQuery } from "@/lib/employer-roles";
import { rankCandidates, buildCandidateCvText, DEFAULT_ROLE, CANDIDATES } from "@/lib/employer-candidates";

const SUGGESTED_CHIPS = [
  "Backend SWE — Node.js Python Go",
  "Data Analyst Intern",
  "Product/UX Associate",
  "Cybersecurity Analyst",
  "Finance Graduate Analyst",
];

// Distinct filter values, derived from the pool so new ones appear automatically.
const STATUS_VALUES = Array.from(new Set(CANDIDATES.map((c) => c.intentSignal)));
const READINESS_VALUES = Array.from(new Set(CANDIDATES.map((c) => c.readiness)));

export function BestFitCandidatesPane({ initialRole }: { initialRole: string }) {
  const { activeRole, connections, requestConnect, profile } = useEmployerWorkspace();

  const [typed, setTyped] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cvForId, setCvForId] = useState<string | null>(null);
  const [compareForId, setCompareForId] = useState<string | null>(null);
  const [filters, setFilters] = useState<CandidateFilterState>(EMPTY_FILTERS);

  const effectiveQuery = typed.trim() || (activeRole ? roleToQuery(activeRole) : initialRole);
  const results = useMemo(() => rankCandidates(effectiveQuery), [effectiveQuery]);

  // Counts are over the searched set (pre-filter), so the dropdown shows how
  // many candidates in view match each option.
  const mustHavesCount = results.filter((r) => r.meetsAllMustHaves).length;
  const statusOptions = STATUS_VALUES.map((value) => ({
    value,
    count: results.filter((r) => r.candidate.intentSignal === value).length,
  }));
  const readinessOptions = READINESS_VALUES.map((value) => ({
    value,
    count: results.filter((r) => r.candidate.readiness === value).length,
  }));

  const filtered = useMemo(
    () =>
      results.filter((r) => {
        if (filters.meetsMustHaves && !r.meetsAllMustHaves) return false;
        if (filters.status.length && !filters.status.includes(r.candidate.intentSignal)) return false;
        if (filters.readiness.length && !filters.readiness.includes(r.candidate.readiness)) return false;
        return true;
      }),
    [results, filters]
  );

  const activeChips: { label: string; clear: () => void }[] = [
    ...(filters.meetsMustHaves
      ? [{ label: "Meets all must-haves", clear: () => setFilters((f) => ({ ...f, meetsMustHaves: false })) }]
      : []),
    ...filters.status.map((v) => ({
      label: v,
      clear: () => setFilters((f) => ({ ...f, status: f.status.filter((x) => x !== v) })),
    })),
    ...filters.readiness.map((v) => ({
      label: v,
      clear: () => setFilters((f) => ({ ...f, readiness: f.readiness.filter((x) => x !== v) })),
    })),
  ];

  const cvCandidate = results.find((r) => r.candidate.id === cvForId)?.candidate ?? null;

  function downloadCv(id: string) {
    const c = results.find((r) => r.candidate.id === id)?.candidate;
    if (!c) return;
    const blob = new Blob([buildCandidateCvText(c)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${c.name.replace(/\s+/g, "_")}_CV.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-display text-2xl text-navy-900 leading-tight">Candidates we think suit you</h2>
        <p className="text-sm text-navy-500 mt-1 max-w-2xl">
          Ranked by real project evidence and skill fit — no scores. Expand a row to see why each
          person fits, or <span className="font-semibold text-navy-700">Compare</span> them against your role.
        </p>
      </div>

      {/* Active role banner */}
      {activeRole && (
        <div className="rounded-2xl border border-gold-200 bg-gold-50/70 p-4 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Star className="w-4 h-4 text-gold-600" />
            <span className="text-sm font-bold text-navy-900">Best-fit for: {activeRole.title}</span>
            <span className="px-2 py-0.5 rounded-full bg-white border border-gold-200 text-[11px] font-semibold text-navy-600">
              {activeRole.level} · {activeRole.workMode}
            </span>
          </div>
          {activeRole.mustHaveSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[11px] font-semibold text-navy-500 mr-0.5">Must-have:</span>
              {activeRole.mustHaveSkills.map((s) => (
                <span key={s} className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-medium text-emerald-700">{s}</span>
              ))}
            </div>
          )}
          <p className="text-[11px] text-navy-500 mt-2">Ranking uses this role&rsquo;s skills. Search below to explore ad-hoc.</p>
        </div>
      )}

      {/* Search + filters */}
      <div className="flex items-stretch gap-2 max-w-2xl">
        <form onSubmit={(e) => e.preventDefault()} className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400 pointer-events-none" />
          <input
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={activeRole ? `Override: search beyond ${activeRole.title}…` : "e.g. Backend developer with Node.js, Python, Go"}
            aria-label="Search candidates by role or skills"
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-beige-300 bg-white text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-4 focus:ring-gold-500/15 focus:border-gold-400 transition-all shadow-sm"
          />
        </form>
        <CandidateFilters
          value={filters}
          onChange={setFilters}
          mustHavesCount={mustHavesCount}
          statusOptions={statusOptions}
          readinessOptions={readinessOptions}
        />
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {SUGGESTED_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => { setTyped(chip); setExpandedId(null); }}
            className="px-3 py-1.5 rounded-full border border-beige-300 bg-white text-xs font-medium text-navy-600 hover:border-gold-300 hover:text-navy-900 transition-all"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {activeChips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={chip.clear}
              className="inline-flex items-center gap-1.5 pl-2.5 pr-2 py-1 rounded-full bg-gold-50 border border-gold-300 text-[12px] font-semibold text-navy-800 hover:bg-gold-100 transition-all"
            >
              {chip.label}
              <X className="w-3 h-3 text-navy-500" />
            </button>
          ))}
          <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="text-[12px] font-semibold text-navy-400 hover:text-navy-900 underline underline-offset-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Accordion rows */}
      <div className="flex items-center justify-between mt-6 mb-3">
        <h3 className="text-sm font-bold text-navy-900">
          Candidates for &ldquo;{typed.trim() || activeRole?.title || initialRole || DEFAULT_ROLE}&rdquo;
        </h3>
        <span className="text-xs text-navy-400">
          {filtered.length} candidate{filtered.length === 1 ? "" : "s"}
          {activeFilterCount(filters) > 0 ? ` of ${results.length}` : ""}
        </span>
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-beige-300 bg-white/60 p-8 text-center">
          <p className="text-sm text-navy-600">No candidates match these filters.</p>
          <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="mt-2 text-[13px] font-semibold text-gold-700 hover:text-gold-600"
          >
            Clear filters
          </button>
        </div>
      ) : (
      <div className="space-y-3">
        {filtered.map((result) => (
          <CandidateRow
            key={result.candidate.id}
            result={result}
            connection={connections[result.candidate.id] ?? "none"}
            companyName={profile.companyName}
            expanded={expandedId === result.candidate.id}
            role={activeRole ?? null}
            comparing={compareForId === result.candidate.id}
            onToggle={() => setExpandedId((cur) => (cur === result.candidate.id ? null : result.candidate.id))}
            onConnect={() => requestConnect(result.candidate.id)}
            onCompare={() => setCompareForId((cur) => (cur === result.candidate.id ? null : result.candidate.id))}
            onViewCV={() => setCvForId(result.candidate.id)}
            onDownloadCV={() => downloadCv(result.candidate.id)}
          />
        ))}
      </div>
      )}

      {cvCandidate && <CandidateCVModal candidate={cvCandidate} onClose={() => setCvForId(null)} />}
    </div>
  );
}
