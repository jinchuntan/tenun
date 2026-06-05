"use client";

import { Award, CheckCircle2, Target, ListChecks, RotateCcw } from "lucide-react";
import type { FinalReport } from "./types";

interface Props {
  report: FinalReport;
  onRestart: () => void;
}

export function InterviewFinalReport({ report, onRestart }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-beige-300 shadow-sm overflow-hidden">
      {/* Header with overall score */}
      <div className="px-6 py-6 bg-[#0a1628] text-white">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[#d4a017]/15 border border-[#d4a017]/30 shrink-0">
            <Award size={28} className="text-[#d4a017]" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Final report</p>
            <p className="text-2xl font-bold">
              {report.overallScore}
              <span className="text-base font-medium text-white/60"> / 10</span>
            </p>
            <p className="text-xs text-white/60 mt-0.5">Overall interview score</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <ReportList
          icon={<CheckCircle2 size={15} className="text-green-500" aria-hidden="true" />}
          heading="Strengths"
          headingClass="text-green-700"
          items={report.strengths}
        />

        <ReportList
          icon={<Target size={15} className="text-[#d4a017]" aria-hidden="true" />}
          heading="Areas to improve"
          headingClass="text-[#a97d12]"
          items={report.improvementAreas}
        />

        <ReportList
          icon={<ListChecks size={15} className="text-navy-500" aria-hidden="true" />}
          heading="Recommended practice"
          headingClass="text-navy-600"
          items={report.recommendedPractice}
        />

        <button
          onClick={onRestart}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0a1628] text-white text-sm font-semibold hover:bg-[#1a2a4a] transition-colors"
        >
          <RotateCcw size={15} aria-hidden="true" /> Start a new interview
        </button>
      </div>
    </div>
  );
}

function ReportList({
  icon,
  heading,
  headingClass,
  items,
}: {
  icon: React.ReactNode;
  heading: string;
  headingClass: string;
  items: string[];
}) {
  if (!items.length) return null;
  return (
    <div>
      <h4 className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-2 ${headingClass}`}>
        {icon} {heading}
      </h4>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-navy-700">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-beige-500 shrink-0" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
