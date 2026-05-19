"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Cpu,
  Briefcase,
  GraduationCap,
  Heart,
  TrendingUp,
  DollarSign,
  Sun,
  Building2,
  ChevronRight,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CareerThread } from "@/lib/types";

const iconMap: Record<string, React.ElementType> = {
  Cpu,
  Briefcase,
  GraduationCap,
  Heart,
  TrendingUp,
  DollarSign,
  Sun,
  Building2,
};

export function ThreadMap({ threads }: { threads: CareerThread[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-navy-900">
            Career Thread Map
          </h2>
          <p className="text-sm text-navy-500 mt-1">
            Your profile broken down into 8 career dimensions
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-2xl font-bold text-navy-900">
            {Math.round(
              threads.reduce((s, t) => s + t.score, 0) / threads.length
            )}
          </div>
          <div className="text-xs text-navy-400">Avg. Score</div>
        </div>
      </div>

      {/* Thread visualization — abstract connected nodes */}
      <div className="relative bg-gradient-to-br from-navy-50 to-beige-50 rounded-2xl p-4 sm:p-8 overflow-hidden">
        <svg
          viewBox="0 0 700 200"
          className="w-full h-auto"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Connection lines */}
          {threads.map((t, i) => {
            const x = 45 + (i * 610) / (threads.length - 1);
            const y = 100 + Math.sin(i * 0.9) * 35;
            const nextI = (i + 1) % threads.length;
            const nx = 45 + (nextI * 610) / (threads.length - 1);
            const ny = 100 + Math.sin(nextI * 0.9) * 35;
            if (i < threads.length - 1) {
              return (
                <motion.line
                  key={`line-${i}`}
                  x1={x}
                  y1={y}
                  x2={nx}
                  y2={ny}
                  stroke={t.color}
                  strokeWidth="2"
                  opacity="0.3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: i * 0.15 }}
                />
              );
            }
            return null;
          })}

          {/* Diagonal cross-connections */}
          {[0, 2, 4, 6].map((i) => {
            if (i + 3 >= threads.length) return null;
            const x1 = 45 + (i * 610) / (threads.length - 1);
            const y1 = 100 + Math.sin(i * 0.9) * 35;
            const x2 = 45 + ((i + 3) * 610) / (threads.length - 1);
            const y2 = 100 + Math.sin((i + 3) * 0.9) * 35;
            return (
              <motion.line
                key={`cross-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={threads[i].color}
                strokeWidth="1"
                opacity="0.12"
                strokeDasharray="4 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 1 + i * 0.1 }}
              />
            );
          })}

          {/* Nodes */}
          {threads.map((t, i) => {
            const x = 45 + (i * 610) / (threads.length - 1);
            const y = 100 + Math.sin(i * 0.9) * 35;
            const radius = 12 + (t.score / 100) * 14;
            return (
              <motion.g key={t.id}>
                {/* Glow */}
                <motion.circle
                  cx={x}
                  cy={y}
                  r={radius + 6}
                  fill={t.color}
                  opacity={0.1}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                />
                {/* Main circle */}
                <motion.circle
                  cx={x}
                  cy={y}
                  r={radius}
                  fill={t.color}
                  opacity={0.8}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.3 + i * 0.1,
                    type: "spring",
                  }}
                />
                {/* Score text */}
                <text
                  x={x}
                  y={y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {t.score}
                </text>
                {/* Label */}
                <text
                  x={x}
                  y={y + radius + 16}
                  textAnchor="middle"
                  fill="#273c6c"
                  fontSize="9"
                  fontWeight="500"
                >
                  {t.name.replace(" Thread", "")}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>

      {/* Thread detail cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {threads.map((thread, i) => {
          const Icon = iconMap[thread.icon] || Cpu;
          return (
            <motion.div
              key={thread.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * i }}
            >
              <Card className="card-hover h-full">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: thread.color + "15" }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{ color: thread.color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-navy-900 text-sm truncate">
                          {thread.name}
                        </h3>
                        <span
                          className="text-lg font-bold shrink-0"
                          style={{ color: thread.color }}
                        >
                          {thread.score}
                        </span>
                      </div>
                      <Progress
                        value={thread.score}
                        className="h-1.5 mt-1"
                        indicatorClassName="rounded-full"
                        style={
                          {
                            "--progress-color": thread.color,
                          } as React.CSSProperties
                        }
                      />
                    </div>
                  </div>
                  <p className="text-xs text-navy-500 leading-relaxed mb-3">
                    {thread.explanation}
                  </p>
                  <div className="flex items-start gap-2 bg-beige-50 rounded-lg p-2.5">
                    <Lightbulb className="w-3.5 h-3.5 text-gold-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-navy-600 leading-relaxed">
                      {thread.improvement}
                    </p>
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
