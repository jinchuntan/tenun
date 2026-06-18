"use client";

import { AnimatePresence } from "framer-motion";
import {
  ChevronDown, ArrowLeftRight, UserPlus, Hourglass, Check, X, CheckCircle2, Sparkles, MapPin, Clock,
} from "lucide-react";
import { CandidateDetail } from "./CandidateDetail";
import { ComparePanel } from "./ComparePanel";
import { provenSkills, fitLabel, type CandidateSearchResult, type ConnectionStatus } from "@/lib/employer-candidates";
import type { EmployerRole } from "@/lib/employer-roles";

interface CandidateRowProps {
  result: CandidateSearchResult;
  connection: ConnectionStatus;
  companyName: string;
  expanded: boolean;
  /** The active role to compare against — enables the inline JD comparison. */
  role: EmployerRole | null;
  /** Whether the side-by-side compare panel is open for this row. */
  comparing: boolean;
  onToggle: () => void;
  onConnect: () => void;
  onCompare: () => void;
  onViewCV: () => void;
  onDownloadCV: () => void;
}

export function CandidateRow({
  result, connection, companyName, expanded, role, comparing,
  onToggle, onConnect, onCompare, onViewCV, onDownloadCV,
}: CandidateRowProps) {
  const { candidate, matchedSkills, meetsAllMustHaves } = result;
  const canCompare = !!role;

  const proven = provenSkills(candidate);
  const fitSkills = Array.from(
    new Set([...matchedSkills.filter((s) => proven.includes(s)), ...proven])
  ).slice(0, 5);

  return (
    <div className={["rounded-2xl border bg-white transition-all", expanded || comparing ? "border-gold-400 ring-2 ring-gold-400/20 shadow-md" : "border-beige-300/60 hover:border-gold-300"].join(" ")}>
      {/* Collapsed header — click to expand */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={onToggle}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }}
        className="p-4 cursor-pointer flex items-start gap-3"
      >
        <div className="w-11 h-11 rounded-full bg-navy-900 text-white text-sm font-bold flex items-center justify-center shrink-0">
          {candidate.initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-navy-900">{candidate.name}</p>
            <span
              className={[
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold",
                meetsAllMustHaves
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-gold-50 text-gold-700 border border-gold-200",
              ].join(" ")}
            >
              {meetsAllMustHaves ? <CheckCircle2 className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
              {fitLabel(result)}
            </span>
          </div>
          {/* What they're good at */}
          <p className="text-[13px] text-navy-700 leading-snug mt-1">{candidate.evidencedClaim}</p>
          {/* Skills */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {fitSkills.map((s) => (
              <span key={s} className="px-2 py-0.5 rounded-full bg-beige-100 text-[11px] font-medium text-navy-700">{s}</span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-navy-500">
            <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {candidate.location}</span>
            <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {candidate.availability}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="shrink-0 flex flex-col items-end gap-1.5">
          <ChevronDown className={`w-5 h-5 text-navy-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onCompare(); }}
            disabled={!canCompare}
            aria-pressed={comparing}
            title={canCompare ? "Compare against your active role" : "Post or select a role to compare"}
            className={[
              "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all",
              !canCompare
                ? "border border-beige-300 text-navy-300 cursor-not-allowed"
                : comparing
                  ? "bg-navy-900 text-white border border-navy-900"
                  : "border border-navy-200 text-navy-700 hover:bg-navy-50",
            ].join(" ")}
          >
            <ArrowLeftRight className="w-3 h-3" /> {comparing ? "Comparing" : "Compare"}
          </button>
          <ConnectButton connection={connection} onClick={(e) => { e.stopPropagation(); onConnect(); }} />
        </div>
      </div>

      {/* Side-by-side JD comparison — slides open beneath the row */}
      <AnimatePresence initial={false}>
        {comparing && role && (
          <ComparePanel role={role} candidate={candidate} onClose={onCompare} />
        )}
      </AnimatePresence>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-beige-200">
          <CandidateDetail
            result={result}
            connection={connection}
            companyName={companyName}
            onViewCV={onViewCV}
            onDownloadCV={onDownloadCV}
            embedded
          />
        </div>
      )}
    </div>
  );
}

function ConnectButton({
  connection, onClick,
}: { connection: ConnectionStatus; onClick: (e: React.MouseEvent) => void }) {
  const base = "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all";
  if (connection === "accepted") return <span className={`${base} bg-emerald-600 text-white`}><Check className="w-3 h-3" /> Connected</span>;
  if (connection === "declined") return <span className={`${base} bg-navy-100 text-navy-500`}><X className="w-3 h-3" /> Declined</span>;
  if (connection === "pending") return <span className={`${base} bg-gold-100 text-gold-700`}><Hourglass className="w-3 h-3" /> Pending</span>;
  return (
    <button type="button" onClick={onClick} className={`${base} bg-gold-500 text-navy-900 hover:bg-gold-400`}>
      <UserPlus className="w-3 h-3" /> Connect
    </button>
  );
}
