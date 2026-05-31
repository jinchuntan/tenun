"use client";

import { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { SkillGap, PathwayCard } from "@/lib/types";
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

type ViewMode = "timeline" | "pathway";

const PRIORITY_COLUMN: Record<SkillGap["priority"], string> = {
  high: "3 months",
  medium: "6 months",
  low: "1 year",
};

const PLATFORM_COLORS: Record<string, string> = {
  Coursera: "bg-blue-500",
  Udemy: "bg-purple-500",
  edX: "bg-red-500",
  "LinkedIn Learning": "bg-sky-500",
  YouTube: "bg-red-500",
  Other: "bg-navy-700",
};

interface Props {
  skillGaps: SkillGap[];
  pathways: PathwayCard[];
  recommendedPathwayId: string;
}

export function SkillsPane({ skillGaps, pathways, recommendedPathwayId }: Props) {
  const [view, setView] = useState<ViewMode>("timeline");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const activePathwayId = useAppSelector((s) => s.dashboard.activePathwayId) ?? recommendedPathwayId;
  const activePathway = pathways.find((p) => p.id === activePathwayId);

  const filteredGaps = activePathway
    ? skillGaps.filter((g) =>
        activePathway.requiredSkills.some(
          (rs) => rs.toLowerCase() === g.skill.toLowerCase()
        )
      )
    : skillGaps;

  const displayGaps = filteredGaps.length > 0 ? filteredGaps : skillGaps;

  function toggleExpanded(skill: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(skill) ? next.delete(skill) : next.add(skill);
      return next;
    });
  }

  const columns = {
    "3 months": displayGaps.filter((g) => PRIORITY_COLUMN[g.priority] === "3 months"),
    "6 months": displayGaps.filter((g) => PRIORITY_COLUMN[g.priority] === "6 months"),
    "1 year": displayGaps.filter((g) => PRIORITY_COLUMN[g.priority] === "1 year"),
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-sm font-semibold text-[#0a1628]">Skill Gaps</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Filtered for{" "}
            <span className="font-medium text-[#0a1628]">
              {activePathway?.name ?? "all paths"}
            </span>
          </p>
        </div>

        <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
          {(["timeline", "pathway"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={[
                "px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize",
                view === v ? "bg-white text-[#0a1628] shadow-sm" : "text-gray-500 hover:text-gray-700",
              ].join(" ")}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "timeline" ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(Object.entries(columns) as [string, SkillGap[]][]).map(([label, gaps]) => (
            <div key={label} className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  {label}
                </p>
                <span className="text-[10px] text-gray-300">{gaps.length}</span>
              </div>
              {gaps.length === 0 ? (
                <p className="text-[11px] text-gray-300 italic">No gaps here</p>
              ) : (
                gaps.map((g) => (
                  <SkillCard
                    key={g.skill}
                    gap={g}
                    expanded={expanded.has(g.skill)}
                    onToggle={() => toggleExpanded(g.skill)}
                  />
                ))
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {displayGaps.map((g) => (
            <SkillCard
              key={g.skill}
              gap={g}
              expanded={expanded.has(g.skill)}
              onToggle={() => toggleExpanded(g.skill)}
              showPriority
            />
          ))}
        </div>
      )}

      {displayGaps.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-medium text-gray-500">No skill gaps identified</p>
          <p className="text-xs text-gray-400 mt-1">You already have the skills needed for this path.</p>
        </div>
      )}
    </div>
  );
}

function SkillCard({
  gap,
  expanded,
  onToggle,
  showPriority = false,
}: {
  gap: SkillGap;
  expanded: boolean;
  onToggle: () => void;
  showPriority?: boolean;
}) {
  const PRIORITY_COLORS = {
    high: "text-red-600 bg-red-50 border-red-100",
    medium: "text-amber-600 bg-amber-50 border-amber-100",
    low: "text-gray-500 bg-gray-50 border-gray-100",
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-medium text-[#0a1628] truncate">{gap.skill}</span>
          {showPriority && (
            <span
              className={[
                "text-[9px] px-1.5 py-0.5 rounded border font-semibold uppercase tracking-wide shrink-0",
                PRIORITY_COLORS[gap.priority],
              ].join(" ")}
            >
              {gap.priority}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp size={13} className="text-gray-400 shrink-0" />
        ) : (
          <ChevronDown size={13} className="text-gray-400 shrink-0" />
        )}
      </button>

      {expanded && gap.courses.length > 0 && (
        <div className="border-t border-gray-100 p-3 space-y-2 bg-gray-50">
          {gap.courses.map((course, i) => (
            <div key={i} className="flex items-start gap-2 bg-white rounded-lg p-2.5 border border-gray-100">
              <div
                className={[
                  "w-1 rounded-full shrink-0 mt-0.5 self-stretch",
                  PLATFORM_COLORS[course.platform] ?? "bg-gray-400",
                ].join(" ")}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#0a1628] truncate">{course.name}</p>
                <p className="text-[10px] text-gray-400">
                  {course.provider} · {course.platform} · {course.duration}
                </p>
              </div>
              {course.url && (
                <a
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-[#4164b4] hover:text-[#2d4fa0] transition-colors"
                  aria-label="Open course"
                >
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
