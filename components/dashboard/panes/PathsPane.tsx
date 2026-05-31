"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setActivePathwayId, setActiveSection } from "@/store/slices/dashboardSlice";
import { PathwayCard } from "@/lib/types";
import { ArrowRight, Clock } from "lucide-react";

interface Props {
  pathways: PathwayCard[];
  recommendedPathwayId: string;
}

export function PathsPane({ pathways, recommendedPathwayId }: Props) {
  const dispatch = useAppDispatch();
  const activePathwayId = useAppSelector((s) => s.dashboard.activePathwayId) ?? recommendedPathwayId;
  const active = pathways.find((p) => p.id === activePathwayId) ?? pathways[0];

  function selectPathway(id: string) {
    dispatch(setActivePathwayId(id));
  }

  function goToSkills() {
    dispatch(setActiveSection("skills"));
  }

  function goToOpportunities() {
    dispatch(setActiveSection("opportunities"));
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-4xl mx-auto">
      <div>
        <h2 className="text-sm font-semibold text-[#0a1628]">Career Paths</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Select a path to filter your skills and opportunities.
        </p>
      </div>

      {/* Pathway pills */}
      <div className="flex flex-wrap gap-2">
        {pathways.map((p) => {
          const isActive = p.id === activePathwayId;
          const isRecommended = p.id === recommendedPathwayId;
          return (
            <button
              key={p.id}
              onClick={() => selectPathway(p.id)}
              className={[
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                isActive
                  ? "text-white border-transparent"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300",
              ].join(" ")}
              style={isActive ? { backgroundColor: p.color, borderColor: p.color } : {}}
            >
              {p.name}
              {isRecommended && (
                <span
                  className={[
                    "text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide",
                    isActive ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700",
                  ].join(" ")}
                >
                  Best fit
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active pathway detail */}
      {active && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div
            className="px-5 py-4 border-b"
            style={{ borderColor: active.color + "30", background: `${active.color}08` }}
          >
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h3 className="font-semibold text-[#0a1628] text-sm">{active.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{active.description}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Clock size={12} className="text-gray-400" />
                <span className="text-xs text-gray-500">{active.timeline}</span>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Role progression */}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Role Progression
              </p>
              <div className="space-y-2">
                {active.roles.map((role, i) => {
                  const steps = role.split(" -> ").flatMap((r) => r.split(" → "));
                  return (
                    <div key={i} className="flex items-center gap-2 flex-wrap">
                      {steps.map((step, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <span
                            className={[
                              "text-xs px-2.5 py-1 rounded-md font-medium",
                              j === 0
                                ? "bg-gray-100 text-gray-600"
                                : j === steps.length - 1
                                ? "text-white"
                                : "bg-gray-50 text-gray-500",
                            ].join(" ")}
                            style={
                              j === steps.length - 1
                                ? { backgroundColor: active.color }
                                : {}
                            }
                          >
                            {step.trim()}
                          </span>
                          {j < steps.length - 1 && (
                            <ArrowRight size={12} className="text-gray-300 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Required skills */}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Skills You Need
              </p>
              <div className="flex flex-wrap gap-1.5">
                {active.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="text-[11px] px-2 py-0.5 rounded border border-gray-200 text-gray-600 bg-gray-50"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Next actions */}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Next Actions
              </p>
              <ul className="space-y-2">
                {active.nextActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                    <span
                      className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                      style={{ backgroundColor: active.color }}
                    >
                      {i + 1}
                    </span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>

            {/* Trade-offs */}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Trade-offs
              </p>
              <ul className="space-y-1">
                {active.tradeoffs.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer links to filtered panes */}
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex gap-3">
            <button
              onClick={goToSkills}
              className="text-xs text-[#4164b4] hover:underline font-medium"
            >
              View skill gaps for this path
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={goToOpportunities}
              className="text-xs text-[#4164b4] hover:underline font-medium"
            >
              View opportunities for this path
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
