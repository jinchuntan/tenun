"use client";

import Image from "next/image";
import { CareerArchetype } from "@/lib/types";
import { getArchetypeImage } from "@/lib/dashboard-images";

interface Props {
  archetype: CareerArchetype;
}

/**
 * Summary tab (Screenshot 1): archetype illustration + identity on the left,
 * a "What we can work on together" growth-areas card on the right.
 */
export function SummaryPane({ archetype }: Props) {
  const image = getArchetypeImage(archetype);

  return (
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
  );
}
