"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu, Briefcase, GraduationCap, Heart, TrendingUp,
  DollarSign, Sun, Building2, Lightbulb, Share2, X, Send,
} from "lucide-react";
import { CareerThread, CareerArchetype } from "@/lib/types";
import { mentors } from "@/lib/mentor-data";

const ICON_MAP: Record<string, React.ElementType> = {
  Cpu, Briefcase, GraduationCap, Heart, TrendingUp, DollarSign, Sun, Building2,
};

// ---------- Radar Chart ----------

function RadarChart({
  threads,
  onSelect,
}: {
  threads: CareerThread[];
  onSelect: (t: CareerThread) => void;
}) {
  const cx = 200, cy = 200, maxR = 155;
  const N = threads.length;
  const angle = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / N;
  const gridLevels = [0.25, 0.5, 0.75, 1];

  const profilePoints = threads.map((t, i) => {
    const a = angle(i);
    const r = (t.score / 100) * maxR;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });

  const profilePath =
    profilePoints
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(" ") + " Z";

  const labelPoint = (i: number) => {
    const a = angle(i);
    return { x: cx + (maxR + 28) * Math.cos(a), y: cy + (maxR + 28) * Math.sin(a) };
  };

  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 400 400" className="w-full max-w-md h-auto">
        {gridLevels.map((level, li) => {
          const pts = threads.map((_, i) => {
            const a = angle(i);
            const r = level * maxR;
            return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
          });
          return (
            <polygon
              key={li}
              points={pts.join(" ")}
              fill="none"
              stroke={li === gridLevels.length - 1 ? "#d9e0f0" : "#ecf0f8"}
              strokeWidth={li === gridLevels.length - 1 ? 1.5 : 1}
            />
          );
        })}

        {threads.map((_, i) => {
          const a = angle(i);
          return (
            <line
              key={i}
              x1={cx} y1={cy}
              x2={cx + maxR * Math.cos(a)} y2={cy + maxR * Math.sin(a)}
              stroke="#d9e0f0" strokeWidth={1}
            />
          );
        })}

        <motion.path
          d={profilePath}
          fill="#4164b4"
          fillOpacity={0.15}
          stroke="#4164b4"
          strokeWidth={2}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />

        {profilePoints.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x} cy={p.y} r={5}
            fill={threads[i].color}
            stroke="white" strokeWidth={1.5}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 + i * 0.06, type: "spring" }}
          />
        ))}

        {threads.map((t, i) => {
          const lp = labelPoint(i);
          const isLeft = lp.x < cx - 10;
          const anchor = isLeft ? "end" : lp.x > cx + 10 ? "start" : "middle";
          return (
            <g key={t.id} onClick={() => onSelect(t)} className="cursor-pointer">
              <text x={lp.x} y={lp.y - 6} textAnchor={anchor} fill="#273c6c" fontSize={9.5} fontWeight="600">
                {t.name.replace(" Thread", "")}
              </text>
              <text x={lp.x} y={lp.y + 7} textAnchor={anchor} fill={t.color} fontSize={8} fontWeight="500">
                {t.contextLabel}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ---------- Share Modal ----------

function ShareModal({ archetype, onClose }: { archetype: CareerArchetype; onClose: () => void }) {
  const [selectedMentorId, setSelectedMentorId] = useState(mentors[0].id);
  const [sent, setSent] = useState(false);
  const mentor = mentors.find((m) => m.id === selectedMentorId)!;

  const subject = `Career Profile Review Request — ${archetype.title}`;
  const body = `Hi ${mentor.name},\n\nMy career archetype is "${archetype.title}" — ${archetype.tagline}. My key strengths include ${archetype.strengths.slice(0, 3).join(", ")}, and I am working on developing ${archetype.growthAreas[0]}.\n\nWould you be open to a brief 20-minute conversation?\n\nThank you,\n[Your Name]`;

  function handleSend() {
    window.open(
      `mailto:${mentor.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      "_blank"
    );
    setSent(true);
    try {
      const stored = JSON.parse(localStorage.getItem("tenun-mentor-contacts") || "[]");
      stored.push({
        mentorId: mentor.id, mentorName: mentor.name, mentorEmail: mentor.email || "",
        sentAt: new Date().toISOString(), followUps: [], status: "sent", subject, body,
      });
      localStorage.setItem("tenun-mentor-contacts", JSON.stringify(stored));
    } catch {}
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-y-auto max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-[#0a1628] text-sm">Share for Review</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {sent ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Send size={18} className="text-green-600" />
              </div>
              <p className="font-medium text-[#0a1628] text-sm">Email client opened</p>
              <p className="text-xs text-gray-500 mt-1">Ready to send from your email app.</p>
              <button onClick={onClose} className="mt-4 text-xs text-gray-500 underline">Close</button>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-500">Select a mentor to send your profile to:</p>
              <div className="space-y-2">
                {mentors.slice(0, 4).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMentorId(m.id)}
                    className={[
                      "w-full text-left p-3 rounded-lg border transition-all",
                      selectedMentorId === m.id
                        ? "border-[#0a1628] bg-[#0a1628]/5"
                        : "border-gray-200 hover:border-gray-300",
                    ].join(" ")}
                  >
                    <p className="font-medium text-[#0a1628] text-xs">{m.name}</p>
                    <p className="text-[11px] text-gray-500">{m.title} · {m.organization}</p>
                  </button>
                ))}
              </div>
              <button
                onClick={handleSend}
                className="w-full flex items-center justify-center gap-2 bg-[#0a1628] text-white rounded-lg py-2.5 text-xs font-medium hover:bg-[#1a2a4a] transition-colors"
              >
                <Send size={14} />
                Open in email client
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ---------- Profile Pane ----------

interface Props {
  archetype: CareerArchetype;
  threads: CareerThread[];
}

export function ProfilePane({ archetype, threads }: Props) {
  const [selectedThread, setSelectedThread] = useState<CareerThread | null>(null);
  const [showShare, setShowShare] = useState(false);

  function handleSelectThread(t: CareerThread) {
    setSelectedThread((prev) => (prev?.id === t.id ? null : t));
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Archetype header */}
      <div
        className="rounded-xl border p-5"
        style={{
          background: `linear-gradient(135deg, ${archetype.color}12, ${archetype.color}06)`,
          borderColor: `${archetype.color}30`,
        }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-bold" style={{ color: archetype.color }}>
              {archetype.title}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{archetype.tagline}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {archetype.keywords.map((kw) => (
                <span
                  key={kw}
                  className="text-[11px] px-2 py-0.5 rounded font-medium"
                  style={{ backgroundColor: archetype.color + "18", color: archetype.color }}
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowShare(true)}
            className="shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors hover:bg-white/50"
            style={{ borderColor: archetype.color + "40", color: archetype.color }}
          >
            <Share2 size={13} />
            Share for Review
          </button>
        </div>

        {/* Strengths + Growth */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <div className="bg-white/60 rounded-lg p-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
              What you bring
            </p>
            <ul className="space-y-1.5">
              {archetype.strengths.map((s) => (
                <li key={s} className="flex items-start gap-2 text-xs text-[#0a1628]">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: archetype.color }}
                  />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white/60 rounded-lg p-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
              What we can work on together
            </p>
            <ul className="space-y-1.5">
              {archetype.growthAreas.map((g) => (
                <li key={g} className="flex items-start gap-2 text-xs text-[#0a1628]">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                  {g}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Career Thread Strength */}
      <div>
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-[#0a1628]">Career Thread Strength</h3>
          <p className="text-xs text-gray-400 mt-0.5">Click any label on the chart to explore that dimension</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 min-w-0">
              <RadarChart threads={threads} onSelect={handleSelectThread} />
            </div>

            <div className="md:w-68 shrink-0 flex items-center">
              <AnimatePresence mode="wait">
                {selectedThread ? (
                  <ThreadDetail
                    key={selectedThread.id}
                    thread={selectedThread}
                    onClose={() => setSelectedThread(null)}
                  />
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center min-h-[180px] text-center w-full"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-2">
                      <Cpu size={18} className="text-gray-300" />
                    </div>
                    <p className="text-xs font-medium text-gray-500">Select a thread</p>
                    <p className="text-[11px] text-gray-400 max-w-[160px] mt-1">
                      Click any label on the chart to explore that dimension
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {showShare && <ShareModal archetype={archetype} onClose={() => setShowShare(false)} />}
    </div>
  );
}

// ---------- Thread Detail ----------

function ThreadDetail({ thread, onClose }: { thread: CareerThread; onClose: () => void }) {
  const Icon = ICON_MAP[thread.icon] || Cpu;
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.18 }}
      className="w-full rounded-xl border p-4"
      style={{ borderColor: thread.color + "50" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: thread.color + "20" }}
          >
            <Icon size={16} style={{ color: thread.color }} />
          </div>
          <div>
            <p className="font-semibold text-[#0a1628] text-xs leading-tight">
              {thread.name.replace(" Thread", "")}
            </p>
            <p className="text-[10px] text-gray-400">{thread.contextLabel}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors">
          <X size={14} />
        </button>
      </div>

      <p className="text-xs text-gray-600 leading-relaxed mb-3">{thread.explanation}</p>

      <div
        className="flex items-start gap-1.5 bg-amber-50 rounded-lg p-2.5 border border-amber-100"
      >
        <Lightbulb size={13} className="text-amber-600 mt-0.5 shrink-0" />
        <p className="text-[11px] text-gray-700 leading-snug">{thread.improvement}</p>
      </div>
    </motion.div>
  );
}
