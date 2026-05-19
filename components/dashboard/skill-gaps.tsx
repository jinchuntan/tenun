"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Clock, ChevronDown, ChevronUp, X } from "lucide-react";
import { SkillGap, CourseResource } from "@/lib/types";

const platformColors: Record<CourseResource["platform"], { bg: string; text: string; dot: string }> = {
  Coursera:          { bg: "bg-blue-50",    text: "text-blue-700",   dot: "#3b82f6" },
  Udemy:             { bg: "bg-purple-50",  text: "text-purple-700", dot: "#8b5cf6" },
  edX:               { bg: "bg-red-50",     text: "text-red-700",    dot: "#ef4444" },
  "LinkedIn Learning":{ bg: "bg-sky-50",    text: "text-sky-700",    dot: "#0ea5e9" },
  YouTube:           { bg: "bg-red-50",     text: "text-red-700",    dot: "#ef4444" },
  Other:             { bg: "bg-navy-50",    text: "text-navy-600",   dot: "#4164b4" },
};

const MILESTONES = [
  { key: "3mo",  label: "3 Months",  color: "#ef4444", bg: "#fef2f2", description: "Quick wins" },
  { key: "6mo",  label: "6 Months",  color: "#f59e0b", bg: "#fffbeb", description: "Build depth" },
  { key: "1yr",  label: "1 Year",    color: "#10b981", bg: "#ecfdf5", description: "Long game" },
];

function distributeGaps(gaps: SkillGap[]) {
  const high   = gaps.filter(g => g.priority === "high");
  const medium = gaps.filter(g => g.priority === "medium");
  const low    = gaps.filter(g => g.priority === "low");

  // Ensure each bucket has at least one item by borrowing from adjacent buckets
  const buckets: SkillGap[][] = [high, medium, low];
  const filled: SkillGap[][] = [[], [], []];

  // First pass: assign by priority
  buckets.forEach((b, i) => { filled[i] = [...b]; });

  // If 3mo is empty, take the first item from 6mo
  if (filled[0].length === 0 && filled[1].length > 0) {
    filled[0].push(filled[1].shift()!);
  }
  // If still empty, take from 1yr
  if (filled[0].length === 0 && filled[2].length > 0) {
    filled[0].push(filled[2].shift()!);
  }
  // If 6mo is empty, take from 1yr
  if (filled[1].length === 0 && filled[2].length > 0) {
    filled[1].push(filled[2].shift()!);
  }
  // If 1yr is still empty, take the last item from 6mo (if > 1 item)
  if (filled[2].length === 0 && filled[1].length > 1) {
    filled[2].push(filled[1].pop()!);
  }

  return { "3mo": filled[0], "6mo": filled[1], "1yr": filled[2] };
}

function CourseItem({ course }: { course: CourseResource }) {
  const c = platformColors[course.platform];
  return (
    <a
      href={course.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-2.5 rounded-xl border border-navy-100 bg-white p-3 hover:border-navy-300 hover:shadow-sm transition-all"
      onClick={e => e.stopPropagation()}
    >
      <div className="w-1 rounded-full shrink-0 self-stretch mt-0.5" style={{ backgroundColor: c.dot, minHeight: 36 }} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-navy-900 leading-snug line-clamp-2 group-hover:text-navy-700">
          {course.name}
        </p>
        <p className="text-[10px] text-navy-400 mt-0.5">{course.provider}</p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>{course.platform}</span>
          <span className="text-[10px] text-navy-400 flex items-center gap-0.5">
            <Clock className="w-3 h-3" />{course.duration}
          </span>
          <ExternalLink className="w-3 h-3 text-navy-300 group-hover:text-navy-600 ml-auto shrink-0" />
        </div>
      </div>
    </a>
  );
}

function SkillPill({
  gap,
  milestoneColor,
  isOpen,
  onClick,
}: {
  gap: SkillGap;
  milestoneColor: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div>
      <button
        onClick={onClick}
        className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all text-xs font-medium"
        style={
          isOpen
            ? { backgroundColor: milestoneColor, color: "white", boxShadow: "0 2px 8px " + milestoneColor + "55" }
            : { backgroundColor: "#f8fafc", color: "#334155", border: "1px solid #e2e8f0" }
        }
      >
        <span className="flex-1 leading-snug">{gap.skill}</span>
        <span className="shrink-0 text-[10px] opacity-70">{gap.courses.length} courses</span>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0" />}
      </button>
    </div>
  );
}

export function SkillGaps({ gaps }: { gaps: SkillGap[] }) {
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const distributed = distributeGaps(gaps);
  const activeGap = gaps.find(g => g.skill === activeSkill) ?? null;

  const toggle = (skill: string) =>
    setActiveSkill(prev => (prev === skill ? null : skill));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-navy-900">Skill Gap Plan</h2>
        <p className="text-sm text-navy-500 mt-1">
          Your learning roadmap — click any skill to see Coursera &amp; Udemy courses
        </p>
      </div>

      {/* Timeline milestones */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {MILESTONES.map(m => {
          const milestoneGaps = distributed[m.key as "3mo" | "6mo" | "1yr"];
          return (
            <div key={m.key} className="flex flex-col gap-2">
              {/* Milestone header */}
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ backgroundColor: m.bg, border: `1.5px solid ${m.color}30` }}
              >
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                <span className="text-xs font-black" style={{ color: m.color }}>{m.label}</span>
                <span className="text-[10px] text-gray-400 font-medium ml-auto">{m.description}</span>
              </div>

              {/* Skills in this milestone */}
              {milestoneGaps.length === 0 ? (
                <div className="rounded-xl border border-dashed border-navy-100 px-3 py-3 text-center">
                  <p className="text-[11px] text-navy-400">No gaps here</p>
                </div>
              ) : (
                milestoneGaps.map(gap => (
                  <SkillPill
                    key={gap.skill}
                    gap={gap}
                    milestoneColor={m.color}
                    isOpen={activeSkill === gap.skill}
                    onClick={() => toggle(gap.skill)}
                  />
                ))
              )}
            </div>
          );
        })}
      </div>

      {/* Course panel — single, shared, slides in below */}
      <AnimatePresence mode="wait">
        {activeGap && (
          <motion.div
            key={activeGap.skill}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-navy-200 bg-white shadow-md overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-navy-50 border-b border-navy-100">
                <div>
                  <h3 className="font-bold text-navy-900 text-sm">{activeGap.skill}</h3>
                  <p className="text-[11px] text-navy-500">{activeGap.courses.length} recommended courses</p>
                </div>
                <button onClick={() => setActiveSkill(null)} className="text-navy-400 hover:text-navy-700 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeGap.courses.map(course => (
                  <CourseItem key={course.url} course={course} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
