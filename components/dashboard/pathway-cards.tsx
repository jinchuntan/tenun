"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  Shuffle,
  Rocket,
  Crown,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Star,
  Zap,
  Target,
  ArrowRight,
  Briefcase,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PathwayCard } from "@/lib/types";

const iconMap: Record<string, React.ElementType> = {
  TrendingUp,
  DollarSign,
  Shuffle,
  Rocket,
  Crown,
};

export function PathwayCards({
  pathways,
  recommendedId,
}: {
  pathways: PathwayCard[];
  recommendedId: string;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-navy-900">
          Pathway Simulator
        </h2>
        <p className="text-sm text-navy-500 mt-1">
          Five realistic career directions tailored to your profile. Click any
          pathway to explore details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {pathways.map((pathway, i) => {
          const Icon = iconMap[pathway.icon] || TrendingUp;
          const isRecommended = pathway.id === recommendedId;
          const isExpanded = expandedId === pathway.id;

          return (
            <motion.div
              key={pathway.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Card
                className={`overflow-hidden transition-all duration-300 cursor-pointer ${
                  isRecommended
                    ? "ring-2 ring-gold-400 shadow-lg shadow-gold-100"
                    : "hover:shadow-md"
                } ${isExpanded ? "shadow-lg" : ""}`}
                onClick={() =>
                  setExpandedId(isExpanded ? null : pathway.id)
                }
              >
                {/* Header */}
                <div className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pathway.gradient} flex items-center justify-center shrink-0`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-navy-900 text-lg">
                          {pathway.name}
                        </h3>
                        {isRecommended && (
                          <Badge variant="secondary" className="gap-1">
                            <Star className="w-3 h-3" />
                            Best Match
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-navy-500 mt-1 line-clamp-2">
                        {pathway.description}
                      </p>
                    </div>
                    <div className="text-right shrink-0 hidden sm:block">
                      <div
                        className="text-2xl font-bold"
                        style={{ color: pathway.color }}
                      >
                        {pathway.score}
                      </div>
                      <div className="text-xs text-navy-400">Score</div>
                    </div>
                    <div className="shrink-0 sm:hidden">
                      <Badge
                        style={{
                          backgroundColor: pathway.color + "20",
                          color: pathway.color,
                        }}
                      >
                        {pathway.score}
                      </Badge>
                    </div>
                  </div>

                  {/* Quick stats */}
                  <div className="flex items-center gap-4 mt-4 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs text-navy-500">
                      <Clock className="w-3.5 h-3.5" />
                      {pathway.timeline}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-navy-500">
                      <Target className="w-3.5 h-3.5" />
                      {pathway.roles.length} role tracks
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-navy-500">
                      <Zap className="w-3.5 h-3.5" />
                      {pathway.requiredSkills.length} skills needed
                    </div>
                    <div className="ml-auto">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-navy-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-navy-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-6 pb-6 border-t border-navy-100 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Roles */}
                          <div>
                            <h4 className="text-sm font-semibold text-navy-800 mb-2 flex items-center gap-1.5">
                              <Briefcase className="w-4 h-4" />
                              Suitable Role Tracks
                            </h4>
                            <ul className="space-y-1.5">
                              {pathway.roles.map((role, j) => (
                                <li
                                  key={j}
                                  className="text-sm text-navy-600 flex items-start gap-2"
                                >
                                  <ArrowRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-navy-400" />
                                  {role}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Required Skills */}
                          <div>
                            <h4 className="text-sm font-semibold text-navy-800 mb-2 flex items-center gap-1.5">
                              <Zap className="w-4 h-4" />
                              Required Skills
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {pathway.requiredSkills.map((skill) => (
                                <Badge
                                  key={skill}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Trade-offs */}
                          <div>
                            <h4 className="text-sm font-semibold text-navy-800 mb-2 flex items-center gap-1.5">
                              <Shuffle className="w-4 h-4" />
                              Trade-offs
                            </h4>
                            <ul className="space-y-1.5">
                              {pathway.tradeoffs.map((t, j) => (
                                <li
                                  key={j}
                                  className="text-sm text-navy-600 flex items-start gap-2"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-navy-300 mt-1.5 shrink-0" />
                                  {t}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Risks */}
                          <div>
                            <h4 className="text-sm font-semibold text-navy-800 mb-2 flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                              Risks to Consider
                            </h4>
                            <ul className="space-y-1.5">
                              {pathway.risks.map((r, j) => (
                                <li
                                  key={j}
                                  className="text-sm text-navy-600 flex items-start gap-2"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                  {r}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Next actions */}
                        <div className="mt-6 bg-gradient-to-r from-navy-50 to-beige-50 rounded-xl p-4">
                          <h4 className="text-sm font-semibold text-navy-800 mb-3 flex items-center gap-1.5">
                            <CheckCircle2
                              className="w-4 h-4"
                              style={{ color: pathway.color }}
                            />
                            Your Next 3 Actions
                          </h4>
                          <ol className="space-y-2">
                            {pathway.nextActions.map((action, j) => (
                              <li
                                key={j}
                                className="flex items-start gap-3 text-sm text-navy-700"
                              >
                                <span
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                                  style={{ backgroundColor: pathway.color }}
                                >
                                  {j + 1}
                                </span>
                                {action}
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
