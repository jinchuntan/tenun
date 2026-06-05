"use client";

import { MapPin, Clock, FolderGit2, Sparkles } from "lucide-react";
import type { CandidateSearchResult } from "@/lib/employer-candidates";

interface CandidateCardProps {
  result: CandidateSearchResult;
  rank: number;
  selected: boolean;
  onSelect: () => void;
}

export function CandidateCard({ result, rank, selected, onSelect }: CandidateCardProps) {
  const { candidate, score, matchedTerms } = result;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        "w-full text-left rounded-2xl border bg-white p-4 transition-all",
        selected
          ? "border-gold-400 ring-2 ring-gold-400/30 shadow-md"
          : "border-beige-300/60 hover:border-gold-300 hover:shadow-sm",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <div className="w-11 h-11 rounded-full bg-navy-900 text-white text-sm font-bold flex items-center justify-center">
            {candidate.initials}
          </div>
          <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-gold-500 text-navy-900 text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
            {rank}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-navy-900 truncate">{candidate.name}</p>
              <p className="text-xs text-navy-500 truncate">{candidate.headline}</p>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-sm font-bold text-gold-600">{score}%</div>
              <p className="text-[10px] text-navy-400 uppercase tracking-wide">match</p>
            </div>
          </div>

          {/* Match score bar */}
          <div className="mt-2 h-1.5 rounded-full bg-beige-200 overflow-hidden">
            <div className="h-full rounded-full bg-gold-500" style={{ width: `${score}%` }} />
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 text-[11px] text-navy-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {candidate.location}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" /> {candidate.availability}
            </span>
            <span className="inline-flex items-center gap-1">
              <FolderGit2 className="w-3 h-3" /> {candidate.projects.length} projects
            </span>
          </div>

          {/* Key skills */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {candidate.skills.slice(0, 4).map((s) => (
              <span key={s} className="px-2 py-0.5 rounded-full bg-beige-100 text-[11px] font-medium text-navy-600">
                {s}
              </span>
            ))}
          </div>

          {/* Why matched */}
          {matchedTerms.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              <Sparkles className="w-3 h-3 text-gold-500" />
              {matchedTerms.slice(0, 4).map((t) => (
                <span key={t} className="px-2 py-0.5 rounded-full bg-gold-50 border border-gold-200 text-[11px] font-medium text-gold-700">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
