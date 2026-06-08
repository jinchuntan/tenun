"use client";

import Image from "next/image";
import { Sparkles, Info, ThumbsUp, AlertTriangle, CalendarCheck, Loader2 } from "lucide-react";
import { CareerArchetype } from "@/lib/types";
import { getArchetypeImage } from "@/lib/dashboard-images";
import { useDashboardPersonalization } from "@/components/dashboard/personalization-context";

interface Props {
  archetype: CareerArchetype;
}

/**
 * Summary tab. The deterministic archetype (title, tagline, keywords, image,
 * growth areas) is the BASE and always renders. The AI personalization layer
 * sits on top as an explanation — and silently disappears if AI is unavailable.
 */
export function SummaryPane({ archetype }: Props) {
  const image = getArchetypeImage(archetype);

  return (
    <div className="space-y-5 sm:space-y-7">
      {/* ── Deterministic base ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-7">
        {/* Left — illustration + identity */}
        <div>
          <div className="rounded-2xl bg-[#f7f5f0] flex items-center justify-center p-6 aspect-[4/3]">
            <div className="relative w-full h-full max-w-[260px]">
              <Image
                src={image}
                alt={`${archetype.title} mascot`}
                fill
                sizes="(max-width: 1024px) 80vw, 260px"
                className="object-contain"
                priority
              />
            </div>
          </div>

          <h2 className="mt-5 text-3xl sm:text-4xl font-black tracking-tight text-[#0a1628]">
            {archetype.title}
          </h2>
          <p className="mt-1.5 text-base sm:text-lg text-[#3a3a3a] leading-snug">
            {archetype.tagline}
          </p>

          <div className="flex flex-wrap gap-2 mt-4">
            {archetype.keywords.map((kw) => (
              <span
                key={kw}
                className="px-3.5 py-1.5 rounded-full border border-[#0a1628]/25 text-sm text-[#0a1628] bg-white/40"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Right — growth areas */}
        <div className="rounded-2xl bg-[#d8d4ca] p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-bold text-[#0a1628]">
            What we can work on together
          </h3>

          <ol className="mt-5 space-y-4">
            {archetype.growthAreas.map((area, i) => (
              <li key={area} className="flex items-center gap-3.5">
                <span className="shrink-0 w-8 h-8 rounded-full bg-[#0a1628] text-white text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-base sm:text-lg text-[#1a1a1a] leading-snug">{area}</span>
              </li>
            ))}
          </ol>

          {archetype.strengths.length > 0 && (
            <div className="mt-7 pt-5 border-t border-[#0a1628]/10">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#0a1628]/50 mb-3">
                What you already bring
              </p>
              <div className="flex flex-wrap gap-2">
                {archetype.strengths.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 rounded-full bg-white/50 text-sm text-[#0a1628]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── AI personalization layer (optional, grounded) ── */}
      <SummaryAILayer />
    </div>
  );
}

function SummaryAILayer() {
  const { summary, summaryStatus } = useDashboardPersonalization();

  if (summaryStatus === "loading") {
    return (
      <div className="rounded-2xl bg-[#0a1628] text-white/80 p-5 sm:p-6 flex items-center gap-3">
        <Loader2 size={18} className="animate-spin text-[#d4a017]" />
        <span className="text-sm">Personalizing your summary…</span>
      </div>
    );
  }

  // Fallback: deterministic archetype + growth areas above already cover this.
  if (summaryStatus !== "ready" || !summary) return null;

  return (
    <div className="space-y-4">
      {/* Personalized narrative */}
      <div className="rounded-2xl bg-[#0a1628] text-white p-5 sm:p-7">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-[#d4a017]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#d4a017]">
            Personalized for you
          </span>
        </div>
        {summary.personalizedSummary && (
          <p className="text-sm sm:text-base leading-relaxed">{summary.personalizedSummary}</p>
        )}
        {summary.whyThisArchetypeFits && (
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            {summary.whyThisArchetypeFits}
          </p>
        )}
      </div>

      {/* Strengths + risks */}
      {(summary.topStrengths.length > 0 || summary.topRisks.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {summary.topStrengths.length > 0 && (
            <div className="rounded-2xl bg-[#d8d4ca] p-5">
              <div className="flex items-center gap-2 mb-3">
                <ThumbsUp size={15} className="text-[#0a1628]" />
                <span className="text-sm font-bold text-[#0a1628]">Top strengths</span>
              </div>
              <ul className="space-y-2">
                {summary.topStrengths.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm text-[#1a1a1a]">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#0a1628] shrink-0" />
                    <span className="leading-snug">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {summary.topRisks.length > 0 && (
            <div className="rounded-2xl bg-[#e7d9c2] p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={15} className="text-[#8a6d1f]" />
                <span className="text-sm font-bold text-[#0a1628]">Worth watching</span>
              </div>
              <ul className="space-y-2">
                {summary.topRisks.map((r, i) => (
                  <li key={i} className="flex gap-2 text-sm text-[#1a1a1a]">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#8a6d1f] shrink-0" />
                    <span className="leading-snug">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Recommended path explanation */}
      {summary.recommendedPathExplanation && (
        <div className="rounded-2xl bg-[#d8d4ca] p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-[#0a1628]/60 mb-2">
            Why your recommended path fits
          </p>
          <p className="text-sm leading-relaxed text-[#1a1a1a]">
            {summary.recommendedPathExplanation}
          </p>
        </div>
      )}

      {/* 30-day actions */}
      {summary.thirtyDayActions.length > 0 && (
        <div className="rounded-2xl bg-[#cfcbc1] p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarCheck size={16} className="text-[#0a1628]" />
            <span className="text-sm font-bold text-[#0a1628]">Your next 30 days</span>
          </div>
          <ol className="space-y-3">
            {summary.thirtyDayActions.map((a, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-[#0a1628] text-white text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#0a1628]">
                    {a.title}
                    {a.timeframe && (
                      <span className="ml-2 text-[11px] font-medium text-[#0a1628]/50">
                        {a.timeframe}
                      </span>
                    )}
                  </p>
                  {a.reason && <p className="text-xs text-[#1a1a1a]/70 mt-0.5 leading-snug">{a.reason}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Confidence note */}
      {summary.confidenceNote && (
        <p className="flex items-start gap-1.5 text-xs text-[#0a1628]/50 italic">
          <Info size={13} className="shrink-0 mt-0.5" />
          {summary.confidenceNote}
        </p>
      )}
    </div>
  );
}
