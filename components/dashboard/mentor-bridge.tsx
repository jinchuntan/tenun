"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  MapPin,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Sparkles,
  Building2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PersonalizedMentor } from "@/lib/types";

interface MentorBridgeProps {
  mentors: PersonalizedMentor[];
  onDraftRequest: (mentor: PersonalizedMentor) => void;
}

function matchColor(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-orange-600";
}

function matchBg(score: number) {
  if (score >= 80) return "bg-emerald-50 border-emerald-200";
  if (score >= 60) return "bg-amber-50 border-amber-200";
  return "bg-orange-50 border-orange-200";
}

const gradients = [
  "from-navy-700 to-navy-500",
  "from-gold-600 to-gold-400",
  "from-emerald-600 to-emerald-400",
  "from-purple-600 to-purple-400",
  "from-blue-600 to-blue-400",
  "from-pink-600 to-pink-400",
  "from-orange-600 to-orange-400",
  "from-teal-600 to-teal-400",
  "from-rose-600 to-rose-400",
  "from-indigo-600 to-indigo-400",
];

export function MentorBridge({ mentors, onDraftRequest }: MentorBridgeProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-700 to-gold-500 flex items-center justify-center">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-navy-900">Mentor Bridge</h2>
          <p className="text-sm text-navy-500">
            Connect with professionals who&apos;ve walked the path you&apos;re exploring
          </p>
        </div>
      </div>

      {/* Mentor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mentors.map((mentor, i) => {
          const isExpanded = expandedId === mentor.id;

          return (
            <motion.div
              key={mentor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
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
                    {/* Avatar */}
                    <div
                      className={`w-11 h-11 rounded-full bg-gradient-to-br ${
                        gradients[i % gradients.length]
                      } flex items-center justify-center shrink-0`}
                    >
                      <span className="text-sm font-bold text-white">
                        {mentor.imageInitials}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-navy-900 text-sm">
                        {mentor.name}
                      </h3>
                      <p className="text-xs text-navy-500 flex items-center gap-1">
                        <Building2 className="w-3 h-3 shrink-0" />
                        {mentor.role} @ {mentor.company}
                      </p>
                      <p className="text-xs text-navy-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {mentor.location} &middot; {mentor.industry}
                      </p>
                    </div>

                    {/* Match score */}
                    <div
                      className={`text-center px-2.5 py-1 rounded-lg border ${matchBg(
                        mentor.matchScore
                      )}`}
                    >
                      <div
                        className={`text-lg font-bold leading-none ${matchColor(
                          mentor.matchScore
                        )}`}
                      >
                        {mentor.matchScore}%
                      </div>
                      <div className="text-[10px] text-navy-400 mt-0.5">
                        match
                      </div>
                    </div>
                  </div>

                  {/* Expertise badges */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {mentor.expertise.slice(0, 4).map((exp) => (
                      <Badge
                        key={exp}
                        variant="secondary"
                        className="text-[10px] px-2 py-0.5"
                      >
                        {exp}
                      </Badge>
                    ))}
                  </div>

                  {/* Match reason */}
                  <p className="text-xs text-navy-500 mt-2 flex items-start gap-1.5">
                    <Sparkles className="w-3 h-3 text-gold-500 shrink-0 mt-0.5" />
                    {mentor.matchReasons[0]}
                  </p>

                  {/* Expand/collapse button */}
                  <button
                    onClick={() =>
                      setExpandedId(isExpanded ? null : mentor.id)
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
                        More info & suggested questions
                      </>
                    )}
                  </button>

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
                        <div className="mt-3 pt-3 border-t border-navy-100">
                          {/* Bio */}
                          <p className="text-xs text-navy-600 leading-relaxed mb-3">
                            {mentor.bio}
                          </p>

                          {/* All match reasons */}
                          {mentor.matchReasons.length > 1 && (
                            <div className="mb-3">
                              <p className="text-[11px] font-medium text-navy-700 mb-1">
                                Why this match:
                              </p>
                              <ul className="space-y-1">
                                {mentor.matchReasons.map((reason, ri) => (
                                  <li
                                    key={ri}
                                    className="text-xs text-navy-500 flex items-start gap-1.5"
                                  >
                                    <span className="text-gold-500 mt-0.5">
                                      &bull;
                                    </span>
                                    {reason}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Suggested questions */}
                          <div className="bg-beige-50 rounded-lg p-3 mb-3">
                            <p className="text-[11px] font-medium text-navy-700 mb-2 flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              Suggested questions to ask:
                            </p>
                            <ul className="space-y-1.5">
                              {mentor.suggestedQuestions.map((q, qi) => (
                                <li
                                  key={qi}
                                  className="text-xs text-navy-600 flex items-start gap-1.5"
                                >
                                  <span className="text-navy-300 font-mono text-[10px] mt-px">
                                    {qi + 1}.
                                  </span>
                                  {q}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Draft request button */}
                          <Button
                            size="sm"
                            className="w-full gap-2 text-xs"
                            onClick={() => onDraftRequest(mentor)}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Draft Mentorship Request
                          </Button>
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
