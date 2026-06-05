"use client";

import {
  Target, FolderGit2, FileCheck2, Gauge, MessageSquare,
  CalendarClock, Wallet, Users, GitBranch, GraduationCap,
} from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

// Icons line up by index with employerTicker.signals in lib/i18n.ts.
const SIGNAL_ICONS = [
  Target,        // Role fit signals
  FolderGit2,    // Portfolio evidence
  FileCheck2,    // CV readiness
  Gauge,         // Skill gap clarity
  MessageSquare, // Interview intent
  CalendarClock, // Availability signals
  Wallet,        // Salary expectation fit
  Users,         // Culture fit context
  GitBranch,     // Career pathway match
  GraduationCap, // Early talent readiness
];

export function EmployerTickerSlim() {
  const { dict } = useLanguage();
  const t = dict.employerTicker;

  // The marquee scrolls translateX(-50%), so the row must be two IDENTICAL
  // halves. Repeat the signal set enough times to exceed any viewport width,
  // keeping the loop seamless with no visible gap.
  const half = [...t.signals, ...t.signals, ...t.signals];
  const items = [...half, ...half];

  return (
    <div className="w-full bg-white border-b border-beige-300/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 sm:gap-4 h-14">
          {/* Left label */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-navy-700 whitespace-nowrap">
              {t.label}
            </span>
          </div>

          <div className="hidden sm:block h-6 w-px bg-beige-300/70 shrink-0" />

          {/* Scrolling signal pills — calm 60s loop (matches the Weaver ticker);
              the base .animate-marquee:hover rule pauses it on hover. */}
          <div className="relative flex-1 overflow-hidden fade-x-mask">
            <div
              className="flex w-max animate-marquee items-center py-1.5"
              style={{ animationDuration: "60s" }}
            >
              {items.map((signal, i) => {
                const Icon = SIGNAL_ICONS[i % t.signals.length] ?? Target;
                return (
                  <span
                    key={`${signal}-${i}`}
                    className="flex-shrink-0 mx-1.5 inline-flex items-center gap-1.5 rounded-full border border-beige-300 bg-white pl-2.5 pr-3 py-1 text-[11px] font-medium text-navy-700 whitespace-nowrap"
                  >
                    <Icon className="w-3.5 h-3.5 text-gold-600 shrink-0" aria-hidden="true" />
                    {signal}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
