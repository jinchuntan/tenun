"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu, Briefcase, GraduationCap, Heart, TrendingUp,
  DollarSign, Sun, Building2, Lightbulb, Share2, X, Send, ChevronDown, ChevronUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CareerThread, CareerArchetype } from "@/lib/types";
import { mentors } from "@/lib/mentor-data";

const iconMap: Record<string, React.ElementType> = {
  Cpu, Briefcase, GraduationCap, Heart, TrendingUp, DollarSign, Sun, Building2,
};

// ---------- Score Ring ----------

function ScoreRing({ score, color, size = 72 }: { score: number; color: string; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const cx = size / 2;
  const cy = size / 2;
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e9eef7" strokeWidth={6} />
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth={6}
        strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize={size < 64 ? 11 : 13} fontWeight="700">
        {score}
      </text>
    </svg>
  );
}

// ---------- Custom SVG Radar ----------

function RadarChart({ threads, onSelect }: { threads: CareerThread[]; onSelect: (t: CareerThread) => void }) {
  const cx = 200, cy = 200, maxR = 155;
  const N = threads.length;
  const angle = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / N;

  const gridLevels = [0.25, 0.5, 0.75, 1];

  const profilePoints = threads.map((t, i) => {
    const a = angle(i);
    const r = (t.score / 100) * maxR;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });

  const profilePath = profilePoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";

  const labelPoint = (i: number) => {
    const a = angle(i);
    return { x: cx + (maxR + 28) * Math.cos(a), y: cy + (maxR + 28) * Math.sin(a) };
  };

  const spideyColor = "#4164b4";

  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 400 400" className="w-full max-w-md h-auto">
        {/* Grid rings */}
        {gridLevels.map((level, li) => {
          const pts = threads.map((_, i) => {
            const a = angle(i);
            const r = level * maxR;
            return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
          });
          return (
            <polygon key={li}
              points={pts.join(" ")}
              fill="none"
              stroke={li === gridLevels.length - 1 ? "#d9e0f0" : "#ecf0f8"}
              strokeWidth={li === gridLevels.length - 1 ? 1.5 : 1}
            />
          );
        })}

        {/* Spokes */}
        {threads.map((_, i) => {
          const a = angle(i);
          return (
            <line key={i}
              x1={cx} y1={cy}
              x2={cx + maxR * Math.cos(a)} y2={cy + maxR * Math.sin(a)}
              stroke="#d9e0f0" strokeWidth={1}
            />
          );
        })}

        {/* Profile area */}
        <motion.path
          d={profilePath}
          fill={spideyColor}
          fillOpacity={0.15}
          stroke={spideyColor}
          strokeWidth={2}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />

        {/* Score dots */}
        {profilePoints.map((p, i) => (
          <motion.circle key={i}
            cx={p.x} cy={p.y} r={5}
            fill={threads[i].color} stroke="white" strokeWidth={1.5}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 + i * 0.06, type: "spring" }}
          />
        ))}

        {/* Labels — clickable */}
        {threads.map((t, i) => {
          const lp = labelPoint(i);
          const Icon = iconMap[t.icon] || Cpu;
          const labelText = t.name.replace(" Thread", "");
          const isLeft = lp.x < cx - 10;
          return (
            <g key={t.id} onClick={() => onSelect(t)} className="cursor-pointer" style={{ outline: "none" }}>
              <text
                x={lp.x}
                y={lp.y - 6}
                textAnchor={isLeft ? "end" : lp.x > cx + 10 ? "start" : "middle"}
                fill="#273c6c"
                fontSize={9.5}
                fontWeight="600"
              >
                {labelText}
              </text>
              <text
                x={lp.x}
                y={lp.y + 7}
                textAnchor={isLeft ? "end" : lp.x > cx + 10 ? "start" : "middle"}
                fill={t.color}
                fontSize={8}
                fontWeight="500"
              >
                {t.contextLabel}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ---------- Share for Review Modal ----------

function ShareForReviewModal({ archetype, onClose }: { archetype: CareerArchetype; onClose: () => void }) {
  const [selectedMentorId, setSelectedMentorId] = useState(mentors[0].id);
  const [sent, setSent] = useState(false);
  const mentor = mentors.find(m => m.id === selectedMentorId)!;

  const subject = `Career Profile Review Request — ${archetype.title}`;
  const body = `Hi ${mentor.name},\n\nMy career archetype has been identified as "${archetype.title}" — ${archetype.tagline}. My key strengths are ${archetype.strengths.slice(0, 3).join(", ")}, and I'm working on developing ${archetype.growthAreas[0]}.\n\nWould you be open to a brief 20-minute conversation to share your thoughts?\n\nThank you,\n[Your Name]`;

  const handleSend = () => {
    window.open(`mailto:${mentor.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");
    setSent(true);
    try {
      const stored = JSON.parse(localStorage.getItem("tenun-mentor-contacts") || "[]");
      stored.push({ mentorId: mentor.id, mentorName: mentor.name, mentorEmail: mentor.email || "", sentAt: new Date().toISOString(), followUps: [], status: "sent", subject, body });
      localStorage.setItem("tenun-mentor-contacts", JSON.stringify(stored));
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-navy-100">
          <h3 className="font-bold text-navy-900">Share for Review</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-navy-400" /></button>
        </div>
        <div className="p-5 space-y-4">
          {sent ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Send className="w-6 h-6 text-green-600" />
              </div>
              <p className="font-semibold text-navy-900">Email opened!</p>
              <p className="text-sm text-navy-500 mt-1">Ready to send in your email client.</p>
              <button onClick={onClose} className="mt-4 text-sm text-navy-600 underline">Done</button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {mentors.slice(0, 4).map(m => (
                  <button key={m.id} onClick={() => setSelectedMentorId(m.id)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${selectedMentorId === m.id ? "border-navy-600 bg-navy-50" : "border-navy-100 hover:border-navy-300"}`}>
                    <div className="font-medium text-navy-900 text-sm">{m.name}</div>
                    <div className="text-xs text-navy-500">{m.title} · {m.organization}</div>
                  </button>
                ))}
              </div>
              <button onClick={handleSend}
                className="w-full flex items-center justify-center gap-2 bg-navy-700 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-navy-800 transition-colors">
                <Send className="w-4 h-4" /> Open in email client
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}


// ---------- Main Component ----------

export function ThreadMap({ threads, archetype }: { threads: CareerThread[]; archetype: CareerArchetype }) {
  const [selectedThread, setSelectedThread] = useState<CareerThread | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Archetype hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="overflow-hidden" style={{ background: `linear-gradient(135deg, ${archetype.color}15, ${archetype.color}06)`, borderColor: `${archetype.color}28` }}>
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-start gap-4 flex-col sm:flex-row">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{archetype.emoji}</span>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold" style={{ color: archetype.color }}>{archetype.title}</h2>
                    <p className="text-sm text-navy-500 italic">{archetype.tagline}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {archetype.keywords.map(kw => (
                    <span key={kw} className="text-[11px] px-2.5 py-1 rounded-full font-medium"
                      style={{ backgroundColor: archetype.color + "15", color: archetype.color }}>
                      {kw}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/60 rounded-xl p-2.5">
                    <p className="text-[10px] font-semibold text-navy-500 uppercase tracking-wide mb-1.5">Strengths</p>
                    {archetype.strengths.map(s => (
                      <div key={s} className="flex items-center gap-1.5 text-xs text-navy-700 mb-1">
                        <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: archetype.color }} />
                        {s}
                      </div>
                    ))}
                  </div>
                  <div className="bg-white/60 rounded-xl p-2.5">
                    <p className="text-[10px] font-semibold text-navy-500 uppercase tracking-wide mb-1.5">Develop</p>
                    {archetype.growthAreas.map(g => (
                      <div key={g} className="flex items-center gap-1.5 text-xs text-navy-700 mb-1">
                        <span className="w-1 h-1 rounded-full bg-navy-300 shrink-0" />
                        {g}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowShareModal(true)}
                className="shrink-0 flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-all hover:shadow-sm"
                style={{ borderColor: archetype.color + "40", color: archetype.color, backgroundColor: archetype.color + "08" }}
              >
                <Share2 className="w-3.5 h-3.5" /> Share for Review
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Thread section */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-bold text-navy-900">Career Thread Strength</h3>
          <p className="text-xs text-navy-500 mt-0.5">Click any spoke label or ring to see what it means for you</p>
        </div>

        {/* Custom SVG radar — detail overlays inside the card */}
        <Card className="mb-4">
          <CardContent className="p-4 sm:p-6 relative">
            <RadarChart threads={threads} onSelect={t => setSelectedThread(prev => prev?.id === t.id ? null : t)} />
            <AnimatePresence>
              {selectedThread && (() => {
                const Icon = iconMap[selectedThread.icon] || Cpu;
                return (
                  <motion.div
                    key={selectedThread.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    className="absolute inset-3 sm:inset-6 flex items-center justify-center pointer-events-none"
                  >
                    <div
                      className="bg-white/96 backdrop-blur-sm rounded-2xl border shadow-xl p-4 w-full max-w-xs pointer-events-auto"
                      style={{ borderColor: selectedThread.color + "50" }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: selectedThread.color + "20" }}>
                            <Icon className="w-4 h-4" style={{ color: selectedThread.color }} />
                          </div>
                          <div>
                            <p className="font-bold text-navy-900 text-sm leading-tight">{selectedThread.name.replace(" Thread","")}</p>
                            <p className="text-[10px] text-navy-400">{selectedThread.contextLabel}</p>
                          </div>
                        </div>
                        <button onClick={() => setSelectedThread(null)} className="text-navy-300 hover:text-navy-600 shrink-0 ml-2">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-navy-600 leading-relaxed mb-2">{selectedThread.explanation}</p>
                      <div className="flex items-start gap-1.5 bg-amber-50 rounded-xl p-2.5 border border-amber-100">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-navy-700 leading-snug">{selectedThread.improvement}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Score rings grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {threads.map((thread, i) => {
            const Icon = iconMap[thread.icon] || Cpu;
            const isSelected = selectedThread?.id === thread.id;
            return (
              <motion.button
                key={thread.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                onClick={() => setSelectedThread(prev => prev?.id === thread.id ? null : thread)}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                  isSelected ? "shadow-md" : "hover:shadow-sm border-transparent hover:border-navy-100"
                }`}
                style={isSelected ? { borderColor: thread.color + "40", backgroundColor: thread.color + "06" } : {}}
              >
                <ScoreRing score={thread.score} color={thread.color} size={64} />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Icon className="w-3 h-3" style={{ color: thread.color }} />
                    <span className="text-[11px] font-semibold text-navy-800">
                      {thread.name.replace(" Thread", "")}
                    </span>
                  </div>
                  <span className="text-[10px] text-navy-400">{thread.contextLabel}</span>
                </div>
                {isSelected ? (
                  <ChevronUp className="w-3 h-3 text-navy-400" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-navy-300" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {showShareModal && (
        <ShareForReviewModal archetype={archetype} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
}
