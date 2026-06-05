"use client";

import { CheckCircle2, TrendingUp, Lightbulb, Star } from "lucide-react";
import type { Feedback } from "./types";

interface Props {
  feedback: Feedback;
}

function scoreColor(score: number): string {
  if (score >= 8) return "#16a34a"; // green
  if (score >= 5) return "#d4a017"; // gold
  return "#dc2626"; // red
}

export function InterviewFeedbackCard({ feedback }: Props) {
  const color = scoreColor(feedback.score);

  return (
    <div className="bg-white rounded-2xl border border-beige-300 shadow-sm overflow-hidden">
      {/* Score header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-beige-200 bg-beige-50">
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl text-white font-bold text-lg shrink-0"
          style={{ backgroundColor: color }}
        >
          {feedback.score}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">Score</p>
          <p className="text-sm font-semibold text-navy-900">{feedback.score} / 10</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {feedback.summary && (
          <p className="text-sm text-navy-700 leading-relaxed">{feedback.summary}</p>
        )}

        {feedback.whatWentWell.length > 0 && (
          <div>
            <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-green-700 mb-2">
              <CheckCircle2 size={14} aria-hidden="true" /> What went well
            </h4>
            <ul className="space-y-1.5">
              {feedback.whatWentWell.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-navy-700">
                  <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {feedback.toImprove.length > 0 && (
          <div>
            <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#a97d12] mb-2">
              <TrendingUp size={14} aria-hidden="true" /> What to improve
            </h4>
            <ul className="space-y-1.5">
              {feedback.toImprove.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-navy-700">
                  <Lightbulb size={14} className="text-[#d4a017] mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {feedback.sampleAnswer && (
          <div className="rounded-xl border border-navy-100 bg-navy-50/60 p-4">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-navy-600 mb-2">
              <Star size={14} aria-hidden="true" /> A stronger sample answer
            </h4>
            <p className="text-sm text-navy-700 leading-relaxed whitespace-pre-line">{feedback.sampleAnswer}</p>
          </div>
        )}
      </div>
    </div>
  );
}
