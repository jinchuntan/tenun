"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Clock, ChevronDown, Sparkles, Loader2 } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setActivePathwayId } from "@/store/slices/dashboardSlice";
import { PathwayCard } from "@/lib/types";
import { getPathwayImage } from "@/lib/dashboard-images";
import { useDashboardPersonalization } from "@/components/dashboard/personalization-context";

interface Props {
  pathways: PathwayCard[];
  recommendedPathwayId: string;
}

/** Split a role progression string on both "->" and "→". */
function parseRoleSteps(role: string): string[] {
  return role
    .split(/\s*(?:->|→)\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function PathsPane({ pathways, recommendedPathwayId }: Props) {
  const dispatch = useAppDispatch();
  const activePathwayId = useAppSelector((s) => s.dashboard.activePathwayId);
  const [expandedId, setExpandedId] = useState<string>(
    activePathwayId ?? recommendedPathwayId
  );

  function toggle(id: string) {
    if (expandedId === id) {
      setExpandedId("");
      return;
    }
    setExpandedId(id);
    dispatch(setActivePathwayId(id)); // selected path drives Skills & Opportunities
  }

  return (
    <div className="space-y-3">
      {pathways.map((p) => (
        <PathRow
          key={p.id}
          pathway={p}
          expanded={expandedId === p.id}
          recommended={p.id === recommendedPathwayId}
          onToggle={() => toggle(p.id)}
        />
      ))}
    </div>
  );
}

function PathRow({
  pathway: p,
  expanded,
  recommended,
  onToggle,
}: {
  pathway: PathwayCard;
  expanded: boolean;
  recommended: boolean;
  onToggle: () => void;
}) {
  const image = getPathwayImage(p);
  const { aiAvailable, ensurePathway } = useDashboardPersonalization();

  // Lazily fetch the AI explanation only when this path is expanded — avoids
  // spamming the API for all five paths on load.
  useEffect(() => {
    if (expanded && aiAvailable) ensurePathway(p);
  }, [expanded, aiAvailable, p, ensurePathway]);

  return (
    <div className="rounded-2xl bg-[#dedbd3] overflow-hidden">
      {/* Row header (always visible) */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="w-full flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 text-left hover:bg-[#e4e1d9] transition-colors"
      >
        <span className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/60 overflow-hidden flex items-center justify-center">
          <Image src={image} alt="" width={56} height={56} className="object-contain w-full h-full p-1" />
        </span>

        <span className="flex-1 min-w-0">
          <span className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[#0a1628] text-sm sm:text-base">{p.name}</span>
            {recommended && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4a017] text-[#0a1628] font-semibold uppercase tracking-wide">
                Best fit
              </span>
            )}
          </span>
          <span className="block text-xs sm:text-sm text-[#0a1628]/60 mt-0.5 line-clamp-2">
            {p.description}
          </span>
        </span>

        <span className="hidden sm:flex items-center gap-1.5 shrink-0 text-xs text-[#0a1628]/60">
          <Clock size={13} />
          {p.timeline}
        </span>

        <span
          className={[
            "shrink-0 w-9 h-9 rounded-full bg-[#0a1628] text-white flex items-center justify-center transition-transform",
            expanded ? "rotate-180" : "",
          ].join(" ")}
        >
          <ChevronDown size={17} />
        </span>
      </button>

      {/* Expanded detail */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <PathDetail pathway={p} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PathDetail({ pathway: p }: { pathway: PathwayCard }) {
  return (
    <div className="px-4 sm:px-5 pb-5 pt-1 space-y-6">
      {/* Mobile timeline (hidden in header on small screens) */}
      <div className="sm:hidden flex items-center gap-1.5 text-xs text-[#0a1628]/60">
        <Clock size={13} />
        {p.timeline}
      </div>

      {/* AI personalization layer (grounded; optional) */}
      <PathAIExplanation pathwayId={p.id} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Role progression */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#0a1628] mb-3">
            Role Progression
          </p>
          <div className="space-y-2">
            {p.roles.map((role, i) => {
              const steps = parseRoleSteps(role);
              return (
                <div key={i} className="flex items-center gap-1.5 flex-wrap">
                  {steps.map((step, j) => (
                    <div key={j} className="flex items-center gap-1.5">
                      <span
                        className={[
                          "text-xs px-2.5 py-1 rounded-full font-medium",
                          j === steps.length - 1
                            ? "bg-[#0a1628] text-white"
                            : "bg-white/70 text-[#0a1628]/70",
                        ].join(" ")}
                      >
                        {step}
                      </span>
                      {j < steps.length - 1 && (
                        <ArrowRight size={12} className="text-[#0a1628]/30 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Skills you need */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#0a1628] mb-3">
            Skills You Need
          </p>
          <div className="flex flex-wrap gap-2">
            {p.requiredSkills.map((skill) => (
              <span
                key={skill}
                className="text-xs px-3 py-1.5 rounded-full bg-white/70 text-[#0a1628]/80"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Steps + trade-offs */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {p.nextActions.slice(0, 3).map((action, i) => (
            <div key={i} className="rounded-2xl bg-[#cfcbc1] p-4 flex flex-col gap-3">
              <span className="self-start text-xs px-3 py-1 rounded-full bg-[#0a1628] text-white font-semibold">
                Step {i + 1}
              </span>
              <p className="text-sm text-[#1a1a1a] leading-snug">{action}</p>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <span className="inline-block text-xs px-3 py-1.5 rounded-full bg-[#0a1628] text-white font-semibold mb-3">
            Trade-offs
          </span>
          <ul className="space-y-2.5">
            {p.tradeoffs.map((t, i) => (
              <li key={i} className="flex gap-2.5 text-xs text-[#0a1628]/70">
                <span className="shrink-0 font-mono text-[#0a1628]/40 border-l-2 border-[#0a1628]/20 pl-2">
                  .{String(i + 1).padStart(2, "0")}
                </span>
                <span className="leading-snug">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/** Grounded AI explanation for the active path. Renders nothing on fallback. */
function PathAIExplanation({ pathwayId }: { pathwayId: string }) {
  const { aiAvailable, getPathway } = useDashboardPersonalization();
  const entry = getPathway(pathwayId);

  if (!aiAvailable) return null;
  if (!entry || entry.status === "error") return null;

  if (entry.status === "loading") {
    return (
      <div className="rounded-2xl bg-[#0a1628] text-white/80 p-4 flex items-center gap-2.5">
        <Loader2 size={15} className="animate-spin text-[#d4a017]" />
        <span className="text-xs">Personalizing this path for you…</span>
      </div>
    );
  }

  const d = entry.data;
  if (!d || (!d.whyFits && !d.whatsDifficult && !d.howToTest30Days)) return null;

  const blocks = [
    { label: "Why this could fit you", text: d.whyFits },
    { label: "What's hard right now", text: d.whatsDifficult },
    { label: "Test it in 30 days", text: d.howToTest30Days },
  ].filter((b) => b.text);

  return (
    <div className="rounded-2xl bg-[#0a1628] text-white p-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={15} className="text-[#d4a017]" />
        <span className="text-xs font-semibold uppercase tracking-wider text-[#d4a017]">
          Personalized for you
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {blocks.map((b) => (
          <div key={b.label}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
              {b.label}
            </p>
            <p className="text-sm leading-snug text-white/90">{b.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
