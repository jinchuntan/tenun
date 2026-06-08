"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { SkillGap, PathwayCard } from "@/lib/types";
import { ExternalLink, ChevronDown } from "lucide-react";

/** Each priority maps to a learning-horizon column. */
const COLUMNS: { key: SkillGap["priority"]; label: string }[] = [
  { key: "high", label: "3 Months Path" },
  { key: "medium", label: "6 Months Path" },
  { key: "low", label: "1 Year Path" },
];

interface Props {
  skillGaps: SkillGap[];
  pathways: PathwayCard[];
  recommendedPathwayId: string;
}

export function SkillsPane({ skillGaps, pathways, recommendedPathwayId }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const activePathwayId = useAppSelector((s) => s.dashboard.activePathwayId) ?? recommendedPathwayId;
  const activePathway = pathways.find((p) => p.id === activePathwayId);

  const filteredGaps = activePathway
    ? skillGaps.filter((g) =>
        activePathway.requiredSkills.some((rs) => rs.toLowerCase() === g.skill.toLowerCase())
      )
    : skillGaps;

  // Gracefully fall back to all gaps when the active path filters everything out.
  const displayGaps = filteredGaps.length > 0 ? filteredGaps : skillGaps;

  function toggle(skill: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) next.delete(skill);
      else next.add(skill);
      return next;
    });
  }

  if (displayGaps.length === 0) {
    return (
      <div className="space-y-4">
        <Header />
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-medium text-[#0a1628]/70">No skill gaps identified</p>
          <p className="text-xs text-[#0a1628]/40 mt-1">
            You already have the skills needed for this path.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Header />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {COLUMNS.map(({ key, label }) => {
          const gaps = displayGaps.filter((g) => g.priority === key);
          return (
            <div key={key} className="space-y-3">
              <div className="rounded-2xl bg-[#d4d0c6] py-3.5 text-center font-bold text-[#0a1628]">
                {label}
              </div>
              <div className="space-y-3">
                {gaps.length === 0 ? (
                  <p className="text-xs text-[#0a1628]/35 italic text-center py-2">
                    Nothing here right now
                  </p>
                ) : (
                  gaps.map((g) => (
                    <SkillCard
                      key={g.skill}
                      gap={g}
                      expanded={expanded.has(g.skill)}
                      onToggle={() => toggle(g.skill)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Header() {
  return (
    <div>
      <h2 className="text-lg font-bold text-[#0a1628]">Skill Gaps</h2>
      <p className="text-xs text-[#0a1628]/50 mt-0.5">Path personally generated for you</p>
    </div>
  );
}

function SkillCard({
  gap,
  expanded,
  onToggle,
}: {
  gap: SkillGap;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-2xl bg-[#f3f1ec] overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-[#eceae3] transition-colors"
      >
        <span className="text-sm font-medium text-[#0a1628] min-w-0 truncate">{gap.skill}</span>
        <span
          className={[
            "shrink-0 w-7 h-7 rounded-full bg-[#0a1628] text-white flex items-center justify-center transition-transform",
            expanded ? "rotate-180" : "",
          ].join(" ")}
        >
          <ChevronDown size={15} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2">
              {gap.courses.length === 0 ? (
                <p className="text-xs text-[#0a1628]/40 px-1 py-2">
                  No course recommendations yet — try a focused online search.
                </p>
              ) : (
                gap.courses.map((course, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 bg-white rounded-xl p-3 border border-black/5"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#0a1628]">{course.name}</p>
                      <p className="text-[11px] text-[#0a1628]/50 mt-0.5">
                        {course.provider} · {course.platform} · {course.duration}
                      </p>
                    </div>
                    {course.url && (
                      <a
                        href={course.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-[#0a1628] hover:text-[#d4a017] transition-colors mt-0.5"
                        aria-label={`Open ${course.name}`}
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
