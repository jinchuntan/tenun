"use client";

import { useEffect, useRef } from "react";
import type { DashboardSection } from "@/store/slices/dashboardSlice";
import type { NavTab } from "./WeaverNavButtons";

/** Panel background — shared with the dashboard card so the active tab connects. */
export const PANEL_BG = "#e7e4dd";

interface Props {
  tabs: NavTab[];
  activeId: DashboardSection;
  onSelect: (id: DashboardSection) => void;
}

/**
 * Folder-style pill tab bar. Every tab is rendered directly in a single
 * horizontally-scrollable row (no "More" dropdown) so all sections are reachable
 * with one tap/swipe. The active tab shares the panel background so it reads as
 * connected to the dashboard card below.
 */
export function WeaverTabBar({ tabs, activeId, onSelect }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the active tab in view when it changes (e.g. via bottom nav buttons),
  // so a tab the user navigated to never stays hidden off-screen on mobile.
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const activeEl = container.querySelector<HTMLElement>(`[data-tab-id="${activeId}"]`);
    activeEl?.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
  }, [activeId]);

  function tabClass(isActive: boolean) {
    return [
      "shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a017] focus-visible:ring-inset",
      isActive
        ? "text-[#0a1628]"
        : "text-[#6b6862] bg-[#d5d1c8] hover:bg-[#dcd8cf] hover:text-[#0a1628]",
    ].join(" ");
  }

  return (
    <div
      ref={scrollRef}
      role="tablist"
      aria-label="Dashboard sections"
      className="relative z-10 -mb-3 flex items-end gap-1 overflow-x-auto pl-4 sm:pl-5 pr-4 sm:pr-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            data-tab-id={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(tab.id)}
            className={tabClass(isActive)}
            style={isActive ? { backgroundColor: PANEL_BG } : undefined}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
