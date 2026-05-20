"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, DollarSign, Shuffle, Rocket, Crown,
  X, Zap, Star, ArrowRight, Clock, ZoomIn, ZoomOut,
  Maximize2, ChevronRight, AlertTriangle, BookOpen, ExternalLink,
} from "lucide-react";
import { PathwayCard, PersonalizedCourseRecommendation } from "@/lib/types";

const iconMap: Record<string, React.ElementType> = {
  TrendingUp, DollarSign, Shuffle, Rocket, Crown,
};

// ── Geometry ───────────────────────────────────────────────────────────────
const CX = 450;
const CY = 450;
const BRANCH_ANGLES = [-90, -18, 54, 126, 198]; // degrees, 72° apart
const RING_R = [138, 255, 375];
const NODE_R = [21, 15, 11]; // radius per level

interface NodeInfo {
  pathwayIdx: number;
  pathwayId: string;
  pathwayName: string;
  pathwayColor: string;
  label: string;
  x: number;
  y: number;
  level: number;
  nextActions: string[];
  skills: string[];
  timeline: string;
  description: string;
  tradeoffs: string[];
  score: number;
}

type Anchor = "start" | "middle" | "end";

function polar(deg: number, r: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function wrapLabel(text: string, maxChars = 13): string[] {
  if (text.length <= maxChars) return [text];
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const candidate = cur ? `${cur} ${w}` : w;
    if (candidate.length <= maxChars) {
      cur = candidate;
    } else {
      if (cur) lines.push(cur);
      cur = w.length > maxChars ? w.slice(0, maxChars) : w;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [text.slice(0, maxChars)];
}

// Place label radially outward; shift perpendicular for steep branches
// so the label doesn't sit on the spoke line.
function getLabelPlacement(x: number, y: number, r: number): { lx: number; ly: number; anchor: Anchor } {
  const dx = x - CX;
  const dy = y - CY;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = dx / dist;
  const ny = dy / dist;
  const pad = r + 22;
  let lx = x + nx * pad;
  let ly = y + ny * pad;
  // For steep branches (|ny| > |nx|) shift label sideways to clear the spoke line
  if (Math.abs(ny) > Math.abs(nx)) {
    lx += -ny * (r * 0.7); // perpendicular x offset
  }
  const anchor: Anchor = lx < CX - 28 ? "end" : lx > CX + 28 ? "start" : "middle";
  return { lx, ly, anchor };
}

interface View { x: number; y: number; scale: number }

// ── Component ──────────────────────────────────────────────────────────────
export function PathwayCards({ pathways, recommendedId, courses }: { pathways: PathwayCard[]; recommendedId: string; courses?: PersonalizedCourseRecommendation[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>({ x: 0, y: 0, scale: 0.6 });
  const [isPanning, setIsPanning] = useState(false);
  const lastPt = useRef({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<NodeInfo | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [activeBranch, setActiveBranch] = useState<string | null>(null);
  const initialized = useRef(false);

  // Build static tree geometry
  const { edges, nodes } = useMemo(() => {
    type Edge = { x1: number; y1: number; x2: number; y2: number; color: string; pathwayId: string };
    const edges: Edge[] = [];
    const nodes: NodeInfo[] = [];
    pathways.forEach((p, pi) => {
      const ang = BRANCH_ANGLES[pi % BRANCH_ANGLES.length];
      const p0 = polar(ang, RING_R[0]);
      edges.push({ x1: CX, y1: CY, x2: p0.x, y2: p0.y, color: p.color, pathwayId: p.id });
      p.roles.slice(0, 3).forEach((role, ri) => {
        const pos = polar(ang, RING_R[ri]);
        if (ri > 0) {
          const prev = polar(ang, RING_R[ri - 1]);
          edges.push({ x1: prev.x, y1: prev.y, x2: pos.x, y2: pos.y, color: p.color, pathwayId: p.id });
        }
        nodes.push({
          pathwayIdx: pi, pathwayId: p.id, pathwayName: p.name,
          pathwayColor: p.color, label: role, x: pos.x, y: pos.y, level: ri,
          nextActions: p.nextActions, skills: p.requiredSkills.slice(0, 5),
          timeline: p.timeline, description: p.description,
          tradeoffs: p.tradeoffs, score: p.score,
        });
      });
    });
    return { edges, nodes };
  }, [pathways]);

  // Center tree on first render
  useEffect(() => {
    if (initialized.current || !containerRef.current) return;
    initialized.current = true;
    const { width, height } = containerRef.current.getBoundingClientRect();
    setView({ scale: 0.6, x: width / 2 - CX * 0.6, y: height / 2 - CY * 0.6 });
  }, []);

  // Mouse-wheel zoom (zooms toward cursor)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      setView(prev => {
        const ns = Math.max(0.22, Math.min(4, prev.scale * factor));
        const ratio = ns / prev.scale;
        return { scale: ns, x: mx - ratio * (mx - prev.x), y: my - ratio * (my - prev.y) };
      });
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  function centerZoom(factor: number) {
    const el = containerRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const mx = width / 2, my = height / 2;
    setView(prev => {
      const ns = Math.max(0.22, Math.min(4, prev.scale * factor));
      const ratio = ns / prev.scale;
      return { scale: ns, x: mx - ratio * (mx - prev.x), y: my - ratio * (my - prev.y) };
    });
  }

  function resetView() {
    const el = containerRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    setView({ scale: 0.6, x: width / 2 - CX * 0.6, y: height / 2 - CY * 0.6 });
  }

  function focusBranch(id: string) {
    const el = containerRef.current;
    if (!el) return;
    const idx = pathways.findIndex(p => p.id === id);
    if (idx < 0) return;
    const mid = polar(BRANCH_ANGLES[idx % BRANCH_ANGLES.length], RING_R[1]);
    const { width, height } = el.getBoundingClientRect();
    const s = 1.2;
    setView({ scale: s, x: width / 2 - mid.x * s, y: height / 2 - mid.y * s });
    setActiveBranch(id);
  }

  const onPanStart = (e: React.PointerEvent) => {
    if ((e.target as Element).closest("[data-node]")) return;
    setIsPanning(true);
    lastPt.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPanMove = (e: React.PointerEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - lastPt.current.x;
    const dy = e.clientY - lastPt.current.y;
    lastPt.current = { x: e.clientX, y: e.clientY };
    setView(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
  };
  const onPanEnd = () => setIsPanning(false);

  const LINE_H = 13; // px between label lines

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-navy-900">Pathway Simulator</h2>
        <p className="text-sm text-navy-500 mt-1">
          Scroll to zoom · drag to pan · tap any node to explore
        </p>
      </div>

      {/* Branch focus pills */}
      <div className="flex flex-wrap gap-2">
        {pathways.map(p => {
          const Icon = iconMap[p.icon] || TrendingUp;
          const active = activeBranch === p.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                if (active) { setActiveBranch(null); setSelectedNode(null); resetView(); }
                else { focusBranch(p.id); setSelectedNode(null); }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
              style={active
                ? { backgroundColor: p.color, borderColor: p.color, color: "white" }
                : activeBranch
                  ? { borderColor: "#e2e8f0", color: "#94a3b8", background: "white" }
                  : { borderColor: "#cbd5e1", color: "#334155", background: "white" }
              }
            >
              <Icon className="w-3 h-3" />
              {p.name.replace(" Path", "")}
              {p.id === recommendedId && <Star className="w-2.5 h-2.5 fill-current" />}
            </button>
          );
        })}
        {activeBranch && (
          <button
            onClick={() => { setActiveBranch(null); setSelectedNode(null); resetView(); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-navy-400 hover:text-navy-700 border border-navy-100 bg-white"
          >
            <X className="w-3 h-3" /> Show all
          </button>
        )}
      </div>

      {/* Canvas + detail panel row */}
      <div className="flex flex-col md:flex-row gap-4 items-start">

        {/* ── SVG canvas ─────────────────────────────────────────────── */}
        <div
          ref={containerRef}
          className="relative flex-1 rounded-2xl overflow-hidden select-none"
          style={{
            height: 520,
            background: "linear-gradient(135deg, #060d1c 0%, #0b1829 55%, #07101e 100%)",
            cursor: isPanning ? "grabbing" : "grab",
          }}
          onPointerDown={onPanStart}
          onPointerMove={onPanMove}
          onPointerUp={onPanEnd}
          onPointerLeave={onPanEnd}
        >
          <svg width="100%" height="100%" style={{ display: "block" }}>
            <defs>
              {/* Glow filter per pathway */}
              {pathways.map(p => (
                <filter key={p.id} id={`glow-${p.id}`} x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
              <filter id="glow-hub" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <g transform={`translate(${view.x},${view.y}) scale(${view.scale})`}>
              {/* Dot-grid background */}
              {Array.from({ length: 24 }, (_, r) =>
                Array.from({ length: 24 }, (_, c) => (
                  <circle key={`d${r}-${c}`} cx={c * 38} cy={r * 38} r={1} fill="#1a3a62" opacity={0.45} />
                ))
              )}

              {/* Dashed ring guides */}
              {RING_R.map((r, i) => (
                <circle key={i} cx={CX} cy={CY} r={r} fill="none"
                  stroke="#132036" strokeWidth={1} strokeDasharray="4 10" />
              ))}

              {/* ── Edges ─────────────────────────────────────────── */}
              {edges.map((e, i) => {
                const dimmed = activeBranch !== null && activeBranch !== e.pathwayId;
                return (
                  <line key={i}
                    x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                    stroke={dimmed ? "#0f1e35" : e.color}
                    strokeWidth={dimmed ? 1.5 : 2.5}
                    strokeLinecap="round"
                    opacity={dimmed ? 0.25 : 0.9}
                    filter={!dimmed ? `url(#glow-${e.pathwayId})` : undefined}
                  />
                );
              })}

              {/* ── Nodes ─────────────────────────────────────────── */}
              {nodes.map((node, ni) => {
                const dimmed = activeBranch !== null && activeBranch !== node.pathwayId;
                const selected = selectedNode?.label === node.label && selectedNode?.pathwayId === node.pathwayId;
                const hovered = hoveredKey === `${node.pathwayId}-${ni}`;
                const r = NODE_R[node.level];
                const { lx, ly, anchor } = getLabelPlacement(node.x, node.y, r);
                const lines = wrapLabel(node.label);

                return (
                  <g key={`n-${ni}`} data-node="true"
                    style={{ cursor: dimmed ? "default" : "pointer" }}
                    onPointerDown={e => e.stopPropagation()}
                    onClick={e => {
                      e.stopPropagation();
                      if (dimmed) return;
                      const same = selectedNode?.label === node.label && selectedNode?.pathwayId === node.pathwayId;
                      setSelectedNode(same ? null : node);
                      setActiveBranch(node.pathwayId);
                    }}
                    onPointerEnter={() => { if (!dimmed) setHoveredKey(`${node.pathwayId}-${ni}`); }}
                    onPointerLeave={() => setHoveredKey(null)}
                  >
                    {/* Outer pulse ring on hover/select */}
                    {(hovered || selected) && (
                      <circle cx={node.x} cy={node.y} r={r + 13}
                        fill={node.pathwayColor} opacity={0.15}
                        filter={`url(#glow-${node.pathwayId})`} />
                    )}
                    {selected && (
                      <circle cx={node.x} cy={node.y} r={r + 7}
                        fill="none" stroke={node.pathwayColor}
                        strokeWidth={1.5} strokeDasharray="3 4" opacity={0.75} />
                    )}

                    {/* Main node disc */}
                    <circle cx={node.x} cy={node.y} r={r}
                      fill={dimmed ? "#0d1b2e" : node.pathwayColor}
                      stroke={dimmed ? "#142030" : "rgba(255,255,255,0.22)"}
                      strokeWidth={1.5}
                      opacity={dimmed ? 0.35 : 1}
                      filter={!dimmed ? `url(#glow-${node.pathwayId})` : undefined}
                    />

                    {/* Specular highlight shimmer */}
                    {!dimmed && (
                      <ellipse
                        cx={node.x - r * 0.22} cy={node.y - r * 0.28}
                        rx={r * 0.42} ry={r * 0.28}
                        fill="white" opacity={0.16}
                      />
                    )}

                    {/* Label — dark background stroke for contrast over lines */}
                    <text
                      textAnchor={anchor}
                      fontSize={10} fontWeight="700"
                      fill={dimmed ? "#1a3050" : (hovered || selected) ? node.pathwayColor : "#7aa3c8"}
                      stroke={dimmed ? undefined : "#07101e"}
                      strokeWidth={dimmed ? 0 : 4}
                      paintOrder={dimmed ? undefined : "stroke"}
                      style={{ pointerEvents: "none", fontFamily: "system-ui, -apple-system, sans-serif" }}
                    >
                      {lines.map((line, li) => (
                        <tspan key={li} x={lx} y={ly + li * LINE_H}>{line}</tspan>
                      ))}
                    </text>
                  </g>
                );
              })}

              {/* ── Hub "YOU" ────────────────────────────────────── */}
              <circle cx={CX} cy={CY} r={45} fill="#1e3a9c" opacity={0.12} filter="url(#glow-hub)" />
              <circle cx={CX} cy={CY} r={32} fill="#0b1628" stroke="#3d5fbb" strokeWidth={2} />
              <circle cx={CX} cy={CY} r={26} fill="#3d5fbb" opacity={0.28} />
              <text x={CX} y={CY + 1} textAnchor="middle" dominantBaseline="middle"
                fontSize={11} fontWeight="800" fill="white"
                letterSpacing="0.1em"
                style={{ fontFamily: "system-ui, sans-serif" }}>
                YOU
              </text>
            </g>
          </svg>

          {/* Zoom controls */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
            {[
              { Icon: ZoomIn, action: () => centerZoom(1.3) },
              { Icon: ZoomOut, action: () => centerZoom(1 / 1.3) },
              { Icon: Maximize2, action: resetView },
            ].map(({ Icon, action }, i) => (
              <button key={i} onClick={action}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}
                onMouseOver={e => (e.currentTarget.style.background = "rgba(255,255,255,0.13)")}
                onMouseOut={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>

          {/* Bottom legend */}
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-x-3 gap-y-1 pointer-events-none">
            {pathways.map(p => (
              <div key={p.id} className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: p.color, boxShadow: `0 0 5px ${p.color}` }} />
                <span className="text-[9px] font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {p.name.replace(" Path", "")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Detail panel ───────────────────────────────────────────── */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              key={`${selectedNode.pathwayId}-${selectedNode.label}`}
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 272 }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="shrink-0 overflow-hidden"
              style={{ minWidth: 0 }}
            >
              <div className="rounded-2xl overflow-y-auto"
                style={{
                  width: 272, height: 520,
                  background: "linear-gradient(160deg, #0c1828 0%, #091422 100%)",
                  border: `1px solid ${selectedNode.pathwayColor}30`,
                }}
              >
                <div className="p-4 flex flex-col gap-4">
                  {/* Node header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: selectedNode.pathwayColor, boxShadow: `0 0 7px ${selectedNode.pathwayColor}` }} />
                        <span className="text-[10px] font-bold uppercase tracking-widest truncate"
                          style={{ color: selectedNode.pathwayColor }}>
                          {selectedNode.pathwayName.replace(" Path", "")}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-sm leading-snug">{selectedNode.label}</h4>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-white/35">
                        <Clock className="w-3 h-3 shrink-0" />
                        {selectedNode.timeline}
                      </div>
                    </div>
                    <button onClick={() => setSelectedNode(null)}
                      className="text-white/25 hover:text-white/60 shrink-0 mt-0.5 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-[11px] text-white/50 leading-relaxed border-t border-white/8 pt-3">
                    {selectedNode.description}
                  </p>

                  {/* How to get here */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5"
                      style={{ color: selectedNode.pathwayColor }}>
                      <ChevronRight className="w-3 h-3" /> How to get here
                    </p>
                    <div className="space-y-2">
                      {selectedNode.nextActions.slice(0, 3).map((action, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5"
                            style={{
                              backgroundColor: selectedNode.pathwayColor + "22",
                              color: selectedNode.pathwayColor,
                              border: `1px solid ${selectedNode.pathwayColor}40`,
                            }}>
                            {i + 1}
                          </span>
                          <p className="text-[11px] text-white/65 leading-snug">{action}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"
                      style={{ color: selectedNode.pathwayColor }}>
                      <Zap className="w-3 h-3" /> Key skills needed
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedNode.skills.map(s => (
                        <span key={s} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: selectedNode.pathwayColor + "18",
                            color: selectedNode.pathwayColor,
                            border: `1px solid ${selectedNode.pathwayColor}28`,
                          }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Trade-offs */}
                  {selectedNode.tradeoffs.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="w-3 h-3" /> Trade-offs
                      </p>
                      <ul className="space-y-1.5">
                        {selectedNode.tradeoffs.slice(0, 3).map((t, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[10px] text-white/40 leading-snug">
                            <span className="text-white/20 shrink-0 mt-px">—</span>{t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Courses */}
                  {courses && courses.filter(c => c.relevantPathways.includes(selectedNode.pathwayId)).length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"
                        style={{ color: selectedNode.pathwayColor }}>
                        <BookOpen className="w-3 h-3" /> Courses to get here
                      </p>
                      <div className="space-y-1.5">
                        {courses
                          .filter(c => c.relevantPathways.includes(selectedNode.pathwayId))
                          .slice(0, 3)
                          .map(course => (
                            course.url ? (
                              <a
                                key={course.id}
                                href={course.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start justify-between gap-2 rounded-lg p-2 group"
                                style={{ backgroundColor: selectedNode.pathwayColor + "12", border: `1px solid ${selectedNode.pathwayColor}22` }}
                              >
                                <div className="min-w-0">
                                  <p className="text-[11px] font-semibold text-white/80 leading-snug group-hover:text-white transition-colors">{course.title}</p>
                                  <p className="text-[9px] text-white/35 mt-0.5">{course.provider}{course.cost ? ` · ${course.cost}` : ""}</p>
                                </div>
                                <ExternalLink className="w-3 h-3 shrink-0 mt-0.5 text-white/20 group-hover:text-white/50 transition-colors" />
                              </a>
                            ) : (
                              <div
                                key={course.id}
                                className="rounded-lg p-2"
                                style={{ backgroundColor: selectedNode.pathwayColor + "12", border: `1px solid ${selectedNode.pathwayColor}22` }}
                              >
                                <p className="text-[11px] font-semibold text-white/80 leading-snug">{course.title}</p>
                                <p className="text-[9px] text-white/35 mt-0.5">{course.provider}{course.cost ? ` · ${course.cost}` : ""}</p>
                              </div>
                            )
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Match score bar */}
                  <div className="border-t border-white/8 pt-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-white/30">Pathway match</span>
                      <span className="text-sm font-bold" style={{ color: selectedNode.pathwayColor }}>
                        {selectedNode.score}%
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-white/8">
                      <motion.div className="h-1 rounded-full"
                        style={{ backgroundColor: selectedNode.pathwayColor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedNode.score}%` }}
                        transition={{ duration: 0.55, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Compact pathway summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {pathways.map(p => {
          const Icon = iconMap[p.icon] || TrendingUp;
          const isRec = p.id === recommendedId;
          const active = activeBranch === p.id;
          return (
            <button key={p.id}
              onClick={() => {
                if (active) { setActiveBranch(null); setSelectedNode(null); resetView(); }
                else { focusBranch(p.id); setSelectedNode(null); }
              }}
              className="text-left rounded-xl border p-3 transition-all hover:shadow-sm"
              style={active
                ? { borderColor: p.color, backgroundColor: p.color + "08" }
                : { borderColor: "#e2e8f0", background: "white" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: p.color + "20" }}>
                  <Icon className="w-3 h-3" style={{ color: p.color }} />
                </div>
                <span className="text-xs font-semibold text-navy-900 flex-1">{p.name.replace(" Path", "")}</span>
                {isRec && (
                  <span className="text-[10px] text-gold-700 font-semibold flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-current" /> Best
                  </span>
                )}
              </div>
              <p className="text-[11px] text-navy-500 leading-snug line-clamp-2">{p.description}</p>
              <div className="flex items-center gap-1 mt-1.5 text-[10px] text-navy-400">
                <Clock className="w-3 h-3" />{p.timeline}
                <ArrowRight className="w-3 h-3 ml-auto" style={{ color: p.color }} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
