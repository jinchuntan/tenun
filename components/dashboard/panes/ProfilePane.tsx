"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu, Briefcase, GraduationCap, Heart, TrendingUp,
  DollarSign, Sun, Building2, Lightbulb, Share2, X, Send,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { CareerThread, CareerArchetype } from "@/lib/types";
import { mentors } from "@/lib/mentor-data";

const ICON_MAP: Record<string, React.ElementType> = {
  Cpu, Briefcase, GraduationCap, Heart, TrendingUp, DollarSign, Sun, Building2,
};

const GOLD = "#d4a017";
const NAVY = "#0a1628";

// ---------- Radar Chart (SVG web + HTML pill labels) ----------

function RadarChart({
  threads,
  activeId,
  onSelect,
}: {
  threads: CareerThread[];
  activeId: string;
  onSelect: (t: CareerThread) => void;
}) {
  const cx = 50, cy = 50, maxR = 33, labelR = 45;
  const N = threads.length;
  const angle = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / N;
  const gridLevels = [0.25, 0.5, 0.75, 1];

  const pt = (i: number, r: number) => ({
    x: cx + r * Math.cos(angle(i)),
    y: cy + r * Math.sin(angle(i)),
  });

  const profilePath =
    threads
      .map((t, i) => {
        const p = pt(i, (t.score / 100) * maxR);
        return `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`;
      })
      .join(" ") + " Z";

  return (
    <div className="relative w-full max-w-[300px] sm:max-w-[440px] mx-auto aspect-square">
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible">
        {gridLevels.map((level, li) => (
          <polygon
            key={li}
            points={threads
              .map((_, i) => {
                const p = pt(i, level * maxR);
                return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
              })
              .join(" ")}
            fill="none"
            stroke="#b3afa4"
            strokeWidth={0.4}
          />
        ))}

        {threads.map((_, i) => {
          const p = pt(i, maxR);
          return (
            <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#b3afa4" strokeWidth={0.4} />
          );
        })}

        <motion.path
          d={profilePath}
          fill={NAVY}
          fillOpacity={0.16}
          stroke={NAVY}
          strokeWidth={0.8}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
        />

        {threads.map((t, i) => {
          const p = pt(i, (t.score / 100) * maxR);
          const isActive = t.id === activeId;
          return (
            <circle
              key={t.id}
              cx={p.x}
              cy={p.y}
              r={isActive ? 1.8 : 1.2}
              fill={isActive ? GOLD : NAVY}
            />
          );
        })}
      </svg>

      {/* HTML pill labels positioned around the web */}
      {threads.map((t, i) => {
        const p = pt(i, labelR);
        const isActive = t.id === activeId;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t)}
            aria-pressed={isActive}
            className={[
              "absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-xs font-semibold whitespace-nowrap transition-colors shadow-sm",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a017]",
              isActive ? "text-[#0a1628]" : "bg-[#0a1628] text-white hover:bg-[#1a2a4a]",
            ].join(" ")}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              backgroundColor: isActive ? GOLD : undefined,
            }}
          >
            {t.name.replace(" Thread", "")}
          </button>
        );
      })}
    </div>
  );
}

// ---------- Thread Detail ----------

function ThreadDetail({
  thread,
  onPrev,
  onNext,
}: {
  thread: CareerThread;
  onPrev: () => void;
  onNext: () => void;
}) {
  const Icon = ICON_MAP[thread.icon] || Cpu;
  const arrow =
    "w-9 h-9 rounded-full bg-[#0a1628] text-white flex items-center justify-center hover:bg-[#1a2a4a] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a017]";

  return (
    <div className="rounded-2xl bg-[#d8d4ca] p-6 sm:p-7 h-full flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center shrink-0">
            <Icon size={20} className="text-[#0a1628]" />
          </div>
          <h3 className="text-2xl font-bold text-[#0a1628] truncate">
            {thread.name.replace(" Thread", "")}
          </h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onPrev} className={arrow} aria-label="Previous thread">
            <ChevronLeft size={16} />
          </button>
          <button onClick={onNext} className={arrow} aria-label="Next thread">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <p className="mt-3 text-sm font-medium text-[#0a1628]/60">{thread.contextLabel}</p>

      <AnimatePresence mode="wait">
        <motion.p
          key={thread.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="mt-4 text-[15px] leading-relaxed text-[#2a2a2a]"
        >
          {thread.explanation}
        </motion.p>
      </AnimatePresence>

      <div className="mt-auto pt-6">
        <div className="flex items-start gap-3 rounded-xl bg-[#c4c0b6] p-4">
          <span className="shrink-0 w-8 h-8 rounded-full bg-[#d4a017] flex items-center justify-center">
            <Lightbulb size={16} className="text-[#0a1628]" />
          </span>
          <p className="text-sm leading-snug text-[#2a2a2a]">{thread.improvement}</p>
        </div>
      </div>
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
  // Default to the strongest thread.
  const strongestIndex = threads.reduce(
    (best, t, i, arr) => (t.score > arr[best].score ? i : best),
    0
  );
  const [index, setIndex] = useState(strongestIndex);
  const [showShare, setShowShare] = useState(false);

  const selected = threads[index];
  const move = (delta: number) =>
    setIndex((i) => (i + delta + threads.length) % threads.length);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#0a1628]">Your Career Threads</h2>
          <p className="text-xs text-[#0a1628]/50 mt-0.5">
            Tap any label to explore that dimension
          </p>
        </div>
        <button
          onClick={() => setShowShare(true)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-[#0a1628]/25 text-[#0a1628] hover:bg-white/50 transition-colors"
        >
          <Share2 size={13} />
          Share for Review
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="rounded-2xl bg-[#cfcbc1] p-5 sm:p-8 flex items-center justify-center">
          <RadarChart
            threads={threads}
            activeId={selected.id}
            onSelect={(t) => setIndex(threads.findIndex((x) => x.id === t.id))}
          />
        </div>

        <ThreadDetail thread={selected} onPrev={() => move(-1)} onNext={() => move(1)} />
      </div>

      {showShare && <ShareModal archetype={archetype} onClose={() => setShowShare(false)} />}
    </div>
  );
}
