"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Award,
  FolderKanban,
  Users2,
  Zap,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ArrowUpRight,
  Clock,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  RecommendationType,
  PersonalizedCourseRecommendation,
  SkillGap,
} from "@/lib/types";

const typeConfig: Record<
  RecommendationType,
  { icon: React.ElementType; label: string; color: string; bg: string }
> = {
  course: {
    icon: BookOpen,
    label: "Course",
    color: "text-blue-700",
    bg: "bg-blue-50",
  },
  certification: {
    icon: Award,
    label: "Certification",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  "portfolio-project": {
    icon: FolderKanban,
    label: "Portfolio Project",
    color: "text-purple-700",
    bg: "bg-purple-50",
  },
  community: {
    icon: Users2,
    label: "Community",
    color: "text-pink-700",
    bg: "bg-pink-50",
  },
  hackathon: {
    icon: Zap,
    label: "Hackathon",
    color: "text-orange-700",
    bg: "bg-orange-50",
  },
  internship: {
    icon: GraduationCap,
    label: "Internship",
    color: "text-amber-700",
    bg: "bg-amber-50",
  },
};

const allTypes: RecommendationType[] = [
  "course",
  "certification",
  "portfolio-project",
  "community",
  "hackathon",
  "internship",
];

const difficultyConfig: Record<
  string,
  { label: string; color: string }
> = {
  beginner: { label: "Beginner", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  intermediate: { label: "Intermediate", color: "text-amber-600 bg-amber-50 border-amber-200" },
  advanced: { label: "Advanced", color: "text-red-600 bg-red-50 border-red-200" },
};

interface CourseRecommendationsProps {
  recommendations: PersonalizedCourseRecommendation[];
  skillGaps: SkillGap[];
}

export function CourseRecommendations({
  recommendations,
  skillGaps,
}: CourseRecommendationsProps) {
  const [activeFilter, setActiveFilter] = useState<RecommendationType | null>(
    null
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = activeFilter
    ? recommendations.filter((r) => r.type === activeFilter)
    : recommendations;

  const gapSkillSet = new Set(skillGaps.map((g) => g.skill.toLowerCase()));

  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-700 to-gold-500 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-navy-900">
            Learning & Portfolio Plan
          </h2>
          <p className="text-sm text-navy-500">
            Courses, projects, and communities to close your skill gaps
          </p>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4">
        <button
          onClick={() => setActiveFilter(null)}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeFilter === null
              ? "bg-navy-700 text-white"
              : "text-navy-500 hover:bg-navy-50 hover:text-navy-700"
          }`}
        >
          All ({recommendations.length})
        </button>
        {allTypes.map((type) => {
          const count = recommendations.filter((r) => r.type === type).length;
          if (count === 0) return null;
          const config = typeConfig[type];
          const Icon = config.icon;
          return (
            <button
              key={type}
              onClick={() =>
                setActiveFilter(activeFilter === type ? null : type)
              }
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeFilter === type
                  ? "bg-navy-700 text-white"
                  : "text-navy-500 hover:bg-navy-50 hover:text-navy-700"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {config.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((rec, i) => {
          const config = typeConfig[rec.type];
          const Icon = config.icon;
          const isExpanded = expandedId === rec.id;
          const diff = difficultyConfig[rec.difficulty];

          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
            >
              <Card
                className={`overflow-hidden transition-all duration-300 ${
                  isExpanded
                    ? "ring-2 ring-navy-200 shadow-lg"
                    : "hover:shadow-md"
                }`}
              >
                <CardContent className="p-4">
                  {/* Top row */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}
                    >
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-navy-900 text-sm leading-tight">
                          {rec.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`shrink-0 text-[10px] px-1.5 py-0 border ${diff.color}`}
                        >
                          {diff.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-navy-400 mt-0.5">
                        {rec.provider}
                      </p>
                    </div>
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-3 mt-2.5 text-[11px] text-navy-500">
                    {rec.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {rec.duration}
                      </span>
                    )}
                    {rec.cost && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {rec.cost}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" />
                      {rec.relevanceScore}% relevant
                    </span>
                  </div>

                  {/* Relevance bar */}
                  <div className="mt-2 h-1.5 bg-navy-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${rec.relevanceScore}%` }}
                      transition={{ duration: 0.8, delay: i * 0.04 + 0.3 }}
                      className={`h-full rounded-full ${
                        rec.relevanceScore >= 70
                          ? "bg-emerald-500"
                          : rec.relevanceScore >= 50
                          ? "bg-amber-500"
                          : "bg-orange-400"
                      }`}
                    />
                  </div>

                  {/* Skill gaps closed preview */}
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {rec.matchingGaps.slice(0, 3).map((gap) => (
                      <span
                        key={gap}
                        className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded"
                      >
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        {gap}
                      </span>
                    ))}
                    {rec.matchingGaps.length > 3 && (
                      <span className="text-[10px] text-navy-400 px-1 py-0.5">
                        +{rec.matchingGaps.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Expand/collapse */}
                  <button
                    onClick={() =>
                      setExpandedId(isExpanded ? null : rec.id)
                    }
                    className="flex items-center gap-1 text-xs text-navy-400 hover:text-navy-600 transition-colors mt-2"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        Less info
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        Why this matters
                      </>
                    )}
                  </button>

                  {/* Expanded */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 pt-3 border-t border-navy-100 space-y-3">
                          {/* Why it matters */}
                          <div>
                            <p className="text-[11px] font-medium text-navy-700 mb-1">
                              Why it matters:
                            </p>
                            <p className="text-xs text-navy-600 leading-relaxed">
                              {rec.whyItMatters}
                            </p>
                          </div>

                          {/* Pathway improvement */}
                          <div className="bg-beige-50 rounded-lg p-3">
                            <p className="text-[11px] font-medium text-navy-700 mb-1 flex items-center gap-1">
                              <ArrowUpRight className="w-3 h-3 text-gold-500" />
                              Pathway impact:
                            </p>
                            <p className="text-xs text-navy-600 leading-relaxed">
                              {rec.pathwayImprovement}
                            </p>
                          </div>

                          {/* All skill gaps closed */}
                          <div>
                            <p className="text-[11px] font-medium text-navy-700 mb-1.5">
                              Skill gaps addressed:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {rec.skillGapsClosed.map((skill) => {
                                const isUserGap = gapSkillSet.has(
                                  skill.toLowerCase()
                                );
                                return (
                                  <span
                                    key={skill}
                                    className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${
                                      isUserGap
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        : "bg-navy-50 text-navy-500 border border-navy-200"
                                    }`}
                                  >
                                    {isUserGap && (
                                      <CheckCircle2 className="w-2.5 h-2.5" />
                                    )}
                                    {skill}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
