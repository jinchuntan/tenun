"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DashboardSection } from "@/store/slices/dashboardSlice";

export interface NavTab {
  id: DashboardSection;
  label: string;
}

interface Props {
  tabs: NavTab[];
  activeId: DashboardSection;
  onNavigate: (id: DashboardSection) => void;
}

/**
 * Bottom "‹ Prev" / "Next ›" navigation pills that step through the tab order,
 * mirroring the black rounded buttons in the design screenshots.
 */
export function WeaverNavButtons({ tabs, activeId, onNavigate }: Props) {
  const index = tabs.findIndex((t) => t.id === activeId);
  const prev = index > 0 ? tabs[index - 1] : null;
  const next = index >= 0 && index < tabs.length - 1 ? tabs[index + 1] : null;

  const pill =
    "inline-flex items-center gap-1.5 min-w-0 max-w-[48%] px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#0a1628] text-white text-xs sm:text-sm font-semibold hover:bg-[#1a2a4a] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a017]";

  return (
    <div className="flex items-center justify-between gap-2 pt-2">
      {prev ? (
        <button
          type="button"
          onClick={() => onNavigate(prev.id)}
          className={pill}
          aria-label={`Go to ${prev.label}`}
        >
          <ChevronLeft size={15} className="shrink-0" aria-hidden="true" />
          <span className="truncate">{prev.label}</span>
        </button>
      ) : (
        <span />
      )}

      {next ? (
        <button
          type="button"
          onClick={() => onNavigate(next.id)}
          className={pill}
          aria-label={`Go to ${next.label}`}
        >
          <span className="truncate">{next.label}</span>
          <ChevronRight size={15} className="shrink-0" aria-hidden="true" />
        </button>
      ) : (
        <span />
      )}
    </div>
  );
}
