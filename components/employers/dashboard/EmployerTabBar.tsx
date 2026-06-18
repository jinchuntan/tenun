"use client";

import { Briefcase, Users, Trophy, Building2 } from "lucide-react";

export type EmployerTab = "postings" | "candidates" | "top" | "profile";

const TABS: { id: EmployerTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "postings", label: "Job postings", icon: Briefcase },
  { id: "candidates", label: "Best-fit candidates", icon: Users },
  { id: "top", label: "Top this month", icon: Trophy },
  { id: "profile", label: "Company profile", icon: Building2 },
];

interface EmployerTabBarProps {
  active: EmployerTab;
  onSelect: (tab: EmployerTab) => void;
}

export function EmployerTabBar({ active, onSelect }: EmployerTabBarProps) {
  return (
    <div role="tablist" className="flex flex-wrap gap-2 border-b border-beige-300/60 pb-3 mb-6">
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = id === active;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(id)}
            className={[
              "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
              isActive
                ? "bg-navy-900 text-white shadow-sm"
                : "text-navy-600 hover:bg-white hover:text-navy-900 border border-transparent hover:border-beige-300",
            ].join(" ")}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
