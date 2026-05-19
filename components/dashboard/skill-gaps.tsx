"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, BookOpen, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SkillGap } from "@/lib/types";

const priorityConfig = {
  high: { variant: "danger" as const, label: "High Priority" },
  medium: { variant: "warning" as const, label: "Medium" },
  low: { variant: "outline" as const, label: "Low" },
};

export function SkillGaps({ gaps }: { gaps: SkillGap[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-navy-900">
          Skill Gap Plan
        </h2>
        <p className="text-sm text-navy-500 mt-1">
          Skills to develop, prioritized by how many pathways need them
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {gaps.map((gap, i) => {
          const config = priorityConfig[gap.priority];
          return (
            <motion.div
              key={gap.skill}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
            >
              <Card className="card-hover h-full">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-semibold text-navy-900 text-sm">
                      {gap.skill}
                    </h3>
                    <Badge variant={config.variant} className="text-[10px] shrink-0">
                      {config.label}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-navy-400">Current</span>
                      <span className="text-navy-600 font-medium">
                        {gap.currentLevel}%
                      </span>
                    </div>
                    <div className="relative">
                      <Progress
                        value={gap.requiredLevel}
                        className="h-2"
                        indicatorClassName="bg-navy-200"
                      />
                      <div
                        className="absolute top-0 left-0 h-2 rounded-full bg-navy-600 transition-all duration-700"
                        style={{ width: `${gap.currentLevel}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-navy-400">Target</span>
                      <span className="text-navy-600 font-medium">
                        {gap.requiredLevel}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium text-navy-700 mb-1.5 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      Resources
                    </h4>
                    <ul className="space-y-1">
                      {gap.resources.map((r) => (
                        <li
                          key={r}
                          className="text-xs text-navy-500 flex items-start gap-1.5"
                        >
                          <ArrowUpRight className="w-3 h-3 mt-0.5 shrink-0 text-navy-400" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
