"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  GraduationCap,
  BookOpen,
  Wrench,
  Users,
  Trophy,
  MapPin,
  Clock,
  Filter,
  Sparkles,
  ExternalLink,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Opportunity } from "@/lib/types";

const typeConfig: Record<
  Opportunity["type"],
  { icon: React.ElementType; label: string; color: string; bg: string }
> = {
  job: { icon: Briefcase, label: "Job", color: "text-blue-700", bg: "bg-blue-50" },
  internship: { icon: GraduationCap, label: "Internship", color: "text-purple-700", bg: "bg-purple-50" },
  course: { icon: BookOpen, label: "Course", color: "text-emerald-700", bg: "bg-emerald-50" },
  project: { icon: Wrench, label: "Project", color: "text-orange-700", bg: "bg-orange-50" },
  mentor: { icon: Users, label: "Mentor", color: "text-pink-700", bg: "bg-pink-50" },
  challenge: { icon: Trophy, label: "Challenge", color: "text-amber-700", bg: "bg-amber-50" },
};

const levelConfig: Record<NonNullable<Opportunity["level"]>, { label: string; color: string; bg: string }> = {
  entry: { label: "Entry Level", color: "text-green-700", bg: "bg-green-50" },
  mid: { label: "Mid Level", color: "text-blue-700", bg: "bg-blue-50" },
  senior: { label: "Senior", color: "text-purple-700", bg: "bg-purple-50" },
  executive: { label: "Executive", color: "text-red-700", bg: "bg-red-50" },
};

const allTypes: Opportunity["type"][] = ["job", "internship", "course", "project", "mentor", "challenge"];

export function OpportunityMarketplace({ opportunities }: { opportunities: Opportunity[] }) {
  const [activeFilter, setActiveFilter] = useState<Opportunity["type"] | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered =
    activeFilter === "all"
      ? opportunities
      : opportunities.filter((o) => o.type === activeFilter);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-navy-900">
          Opportunity Marketplace
        </h2>
        <p className="text-sm text-navy-500 mt-1">
          Jobs, courses, mentors, and more — matched to your profile
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        <button
          onClick={() => setActiveFilter("all")}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeFilter === "all"
              ? "bg-navy-700 text-white"
              : "bg-navy-50 text-navy-600 hover:bg-navy-100"
          }`}
        >
          All ({opportunities.length})
        </button>
        {allTypes.map((type) => {
          const config = typeConfig[type];
          const count = opportunities.filter((o) => o.type === type).length;
          if (count === 0) return null;
          return (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeFilter === type
                  ? "bg-navy-700 text-white"
                  : "bg-navy-50 text-navy-600 hover:bg-navy-100"
              }`}
            >
              {config.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((opp, i) => {
          const config = typeConfig[opp.type];
          const Icon = config.icon;
          const isExpanded = expandedId === opp.id;
          const levelCfg = opp.level ? levelConfig[opp.level] : null;

          return (
            <motion.div
              key={opp.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Card
                className={`cursor-pointer transition-all ${
                  isExpanded ? "ring-1 ring-navy-200 shadow-md" : "card-hover"
                }`}
                onClick={() => setExpandedId(isExpanded ? null : opp.id)}
              >
                <CardContent className="p-4 sm:p-5">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-navy-900 text-sm leading-tight">
                            {opp.title}
                          </h3>
                          <p className="text-xs text-navy-500 mt-0.5">{opp.organization}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-lg font-bold text-navy-900">{opp.matchPercentage}%</div>
                          <div className="text-[10px] text-navy-400">match</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Match bar */}
                  <div className="w-full h-1.5 bg-navy-100 rounded-full mb-3 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor:
                          opp.matchPercentage >= 85 ? "#2d8a4e"
                          : opp.matchPercentage >= 70 ? "#d4a017"
                          : "#e17055",
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${opp.matchPercentage}%` }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
                    />
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <Badge className={`text-[10px] ${config.bg} ${config.color} border-none`}>
                      {config.label}
                    </Badge>
                    {levelCfg && (
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${levelCfg.bg} ${levelCfg.color}`}>
                        {levelCfg.label}
                      </span>
                    )}
                    {opp.location && (
                      <span className="text-xs text-navy-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {opp.location}
                      </span>
                    )}
                    {opp.duration && (
                      <span className="text-xs text-navy-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {opp.duration}
                      </span>
                    )}
                  </div>

                  {/* Salary */}
                  {opp.salary && (
                    <div className="flex items-center gap-1 text-xs text-emerald-700 font-semibold mb-2">
                      <DollarSign className="w-3.5 h-3.5" />
                      {opp.salary}
                    </div>
                  )}

                  {/* Expanded */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 pt-3 border-t border-navy-100 space-y-3"
                      onClick={e => e.stopPropagation()}
                    >
                      <p className="text-xs text-navy-600 leading-relaxed">{opp.description}</p>

                      <div>
                        <h4 className="text-xs font-medium text-navy-700 mb-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-gold-500" />
                          Why this matches
                        </h4>
                        <p className="text-xs text-navy-500 leading-relaxed">{opp.whyMatch}</p>
                      </div>

                      <div>
                        <h4 className="text-xs font-medium text-navy-700 mb-1.5">Skills developed</h4>
                        <div className="flex flex-wrap gap-1">
                          {opp.skillsDeveloped.map((s) => (
                            <Badge key={s} variant="success" className="text-[10px]">{s}</Badge>
                          ))}
                        </div>
                      </div>

                      {opp.externalLink ? (
                        <a
                          href={opp.externalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full mt-2 py-2 px-4 rounded-lg bg-navy-700 text-white text-xs font-medium hover:bg-navy-800 transition-colors"
                        >
                          {opp.type === "job" || opp.type === "internship"
                            ? "View on JobStreet / Seek"
                            : opp.type === "course"
                            ? "Open Course"
                            : "View Opportunity"}
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <Button size="sm" variant="outline" className="w-full mt-2 group">
                          Explore Opportunity
                          <ExternalLink className="ml-2 w-3.5 h-3.5" />
                        </Button>
                      )}
                    </motion.div>
                  )}

                  {!isExpanded && (
                    <div className="text-[10px] text-navy-400 flex items-center gap-1 mt-1">
                      <ChevronDown className="w-3 h-3" /> Click to expand
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
