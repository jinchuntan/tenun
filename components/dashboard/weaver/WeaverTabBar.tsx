"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { DashboardSection } from "@/store/slices/dashboardSlice";
import type { NavTab } from "./WeaverNavButtons";

/** Panel background — shared with the dashboard card so the active tab connects. */
export const PANEL_BG = "#e7e4dd";

/** Secondary tabs tucked into the "More" dropdown on every breakpoint. */
const MORE_IDS: DashboardSection[] = ["outreach", "cv", "mock-interview"];

interface Props {
  tabs: NavTab[];
  activeId: DashboardSection;
  onSelect: (id: DashboardSection) => void;
  moreLabel: string;
}

/**
 * Folder-style pill tab bar from the design screenshots. Primary tabs sit in a
 * horizontally scrollable row (so small screens can swipe through them); the
 * three secondary tabs live in a "More" dropdown to keep desktop tidy.
 */
export function WeaverTabBar({ tabs, activeId, onSelect, moreLabel }: Props) {
  const [moreOpen, setMoreOpen] = useState(false);

  const primary = tabs.filter((t) => !MORE_IDS.includes(t.id));
  const more = tabs.filter((t) => MORE_IDS.includes(t.id));
  const moreActive = more.some((t) => t.id === activeId);
  const activeMoreLabel = more.find((t) => t.id === activeId)?.label;

  function tabClass(isActive: boolean) {
    return [
      "shrink-0 px-4 sm:px-5 py-2.5 rounded-t-2xl text-sm font-semibold whitespace-nowrap transition-colors",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a017]",
      isActive
        ? "text-[#0a1628]"
        : "text-[#6b6862] bg-[#d5d1c8] hover:bg-[#dcd8cf] hover:text-[#0a1628]",
    ].join(" ");
  }

  return (
    <div className="relative z-10 -mb-3 flex items-end gap-1">
      {/* Primary tabs — horizontally scrollable on small screens */}
      <div className="flex-1 min-w-0 flex items-end gap-1 overflow-x-auto pb-3 -mb-3 scrollbar-thin [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {primary.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
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

      {/* More dropdown */}
      {more.length > 0 && (
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMoreOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={moreOpen}
            className={[
              "flex items-center gap-1 px-4 py-2.5 rounded-t-2xl text-sm font-semibold whitespace-nowrap transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a017]",
              moreActive
                ? "text-[#0a1628]"
                : "text-[#6b6862] bg-[#d5d1c8] hover:bg-[#dcd8cf] hover:text-[#0a1628]",
            ].join(" ")}
            style={moreActive ? { backgroundColor: PANEL_BG } : undefined}
          >
            {moreActive && activeMoreLabel ? activeMoreLabel : moreLabel}
            <ChevronDown
              size={14}
              className={moreOpen ? "rotate-180 transition-transform" : "transition-transform"}
              aria-hidden="true"
            />
          </button>

          {moreOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMoreOpen(false)} />
              <div
                role="menu"
                className="absolute right-0 top-full z-20 mt-1 w-44 rounded-xl bg-white shadow-lg ring-1 ring-black/5 py-1"
              >
                {more.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onSelect(tab.id);
                      setMoreOpen(false);
                    }}
                    className={[
                      "w-full text-left px-4 py-2 text-sm transition-colors",
                      tab.id === activeId
                        ? "text-[#0a1628] font-semibold bg-[#f5f0e8]"
                        : "text-gray-600 hover:bg-gray-50",
                    ].join(" ")}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
