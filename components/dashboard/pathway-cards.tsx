"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, DollarSign, Shuffle, Rocket, Crown,
  X, Zap, CheckCircle2, Star, ArrowRight, Clock,
} from "lucide-react";
import { PathwayCard } from "@/lib/types";

const iconMap: Record<string, React.ElementType> = {
  TrendingUp, DollarSign, Shuffle, Rocket, Crown,
};

// SVG canvas — large enough so labels never clip
const SIZE = 700;
const CX = SIZE / 2;   // 350
const CY = SIZE / 2;   // 350

// 5 branches evenly spread, starting at top (−90°)
const BRANCH_ANGLES = [-90, -18, 54, 126, 198];
// 3 role nodes per branch
const NODE_RADII = [100, 178, 248];

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
}

function polar(angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

export function PathwayCards({ pathways, recommendedId }: { pathways: PathwayCard[]; recommendedId: string }) {
  const [activeNode, setActiveNode] = useState<NodeInfo | null>(null);
  const [activeBranch, setActiveBranch] = useState<string | null>(null);

  // Build edges and nodes
  type Edge = { x1: number; y1: number; x2: number; y2: number; color: string; dimmed: boolean };
  const edges: Edge[] = [];
  const nodes: NodeInfo[] = [];

  pathways.forEach((pathway, pi) => {
    const angle = BRANCH_ANGLES[pi % BRANCH_ANGLES.length];
    const dimmed = activeBranch !== null && activeBranch !== pathway.id;

    const firstPt = polar(angle, NODE_RADII[0]);
    edges.push({ x1: CX, y1: CY, x2: firstPt.x, y2: firstPt.y, color: pathway.color, dimmed });

    pathway.roles.slice(0, 3).forEach((role, ri) => {
      const pos = polar(angle, NODE_RADII[ri]);
      if (ri > 0) {
        const prev = polar(angle, NODE_RADII[ri - 1]);
        edges.push({ x1: prev.x, y1: prev.y, x2: pos.x, y2: pos.y, color: pathway.color, dimmed });
      }
      nodes.push({
        pathwayIdx: pi,
        pathwayId: pathway.id,
        pathwayName: pathway.name,
        pathwayColor: pathway.color,
        label: role,
        x: pos.x,
        y: pos.y,
        level: ri,
        nextActions: pathway.nextActions,
        skills: pathway.requiredSkills.slice(0, 4),
      });
    });
  });

  const handleNodeClick = (node: NodeInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    const same = activeNode?.label === node.label && activeNode?.pathwayId === node.pathwayId;
    if (same) {
      setActiveNode(null);
      setActiveBranch(null);
    } else {
      setActiveNode(node);
      setActiveBranch(node.pathwayId);
    }
  };

  const nodeR = (level: number) => [15, 12, 10][level] ?? 10;

  // Label placement: push label away from center on the same axis as the node
  function labelAnchor(x: number) {
    if (x < CX - 20) return "end";
    if (x > CX + 20) return "start";
    return "middle";
  }

  function labelDy(y: number, r: number) {
    // If node is below center, push label below node; if above, push above
    return y >= CY ? r + 13 : -(r + 5);
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-navy-900">Pathway Simulator</h2>
        <p className="text-sm text-navy-500 mt-1">
          Your career skill tree — tap a branch to focus it, tap a node to explore
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {pathways.map((p) => {
          const Icon = iconMap[p.icon] || TrendingUp;
          const isRec = p.id === recommendedId;
          const active = activeBranch === p.id;
          return (
            <button
              key={p.id}
              onClick={() => { setActiveBranch(active ? null : p.id); setActiveNode(null); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
              style={
                active
                  ? { backgroundColor: p.color, borderColor: p.color, color: "white" }
                  : activeBranch !== null
                  ? { borderColor: "#e2e8f0", color: "#94a3b8", background: "white" }
                  : { borderColor: "#cbd5e1", color: "#334155", background: "white" }
              }
            >
              <Icon className="w-3 h-3" />
              {p.name.replace(" Path", "")}
              {isRec && <Star className="w-2.5 h-2.5 fill-current" />}
            </button>
          );
        })}
        {activeBranch && (
          <button
            onClick={() => { setActiveBranch(null); setActiveNode(null); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-navy-400 hover:text-navy-700 border border-navy-100 bg-white"
          >
            <X className="w-3 h-3" /> All
          </button>
        )}
      </div>

      {/* SVG tree + popup overlay */}
      <div
        className="relative bg-white rounded-2xl border border-navy-100 select-none"
        onClick={() => { setActiveNode(null); setActiveBranch(null); }}
      >
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="w-full h-auto"
          style={{ maxHeight: "70vw", minHeight: 280 }}
        >
          {/* Grid rings */}
          {NODE_RADII.map(r => (
            <circle key={r} cx={CX} cy={CY} r={r} fill="none" stroke="#edf2f7" strokeWidth={1.2} strokeDasharray="5 7" />
          ))}

          {/* Branch edges */}
          {edges.map((e, i) => (
            <line
              key={i}
              x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
              stroke={e.dimmed ? "#d1d9eb" : e.color}
              strokeWidth={e.dimmed ? 1.5 : 2.5}
              strokeLinecap="round"
              opacity={e.dimmed ? 0.35 : 1}
            />
          ))}

          {/* Nodes */}
          {nodes.map((node, ni) => {
            const dimmed = activeBranch !== null && activeBranch !== node.pathwayId;
            const selected = activeNode?.label === node.label && activeNode?.pathwayId === node.pathwayId;
            const r = nodeR(node.level);
            const anchor = labelAnchor(node.x);
            const dy = labelDy(node.y, r);
            return (
              <g key={`n-${ni}`} style={{ cursor: "pointer" }} onClick={e => handleNodeClick(node, e)}>
                {selected && (
                  <circle cx={node.x} cy={node.y} r={r + 8} fill={node.pathwayColor} opacity={0.2} />
                )}
                <circle
                  cx={node.x} cy={node.y} r={r}
                  fill={dimmed ? "#d1d9eb" : node.pathwayColor}
                  stroke="white" strokeWidth={2.5}
                  opacity={dimmed ? 0.35 : 1}
                />
                {!dimmed && (
                  <text
                    x={node.x} y={node.y + dy}
                    textAnchor={anchor}
                    fontSize={8} fontWeight="500"
                    fill="#334155"
                    style={{ pointerEvents: "none" }}
                  >
                    {node.label.length > 16 ? node.label.slice(0, 15) + "…" : node.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Centre "YOU" */}
          <circle cx={CX} cy={CY} r={24} fill="#1b2b5e" stroke="white" strokeWidth={3} />
          <text x={CX} y={CY + 1} textAnchor="middle" dominantBaseline="middle" fontSize={10} fontWeight="700" fill="white">
            YOU
          </text>
        </svg>

        {/* Node detail popup — floats over SVG, inside the div */}
        <AnimatePresence>
          {activeNode && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
              className="absolute bottom-3 left-3 right-3 bg-white rounded-xl border shadow-xl p-4 z-10"
              style={{ borderColor: activeNode.pathwayColor + "50" }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activeNode.pathwayColor }} />
                    <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: activeNode.pathwayColor }}>
                      {activeNode.pathwayName.replace(" Path", "")}
                    </span>
                  </div>
                  <h4 className="font-bold text-navy-900 text-sm">{activeNode.label}</h4>
                </div>
                <button onClick={() => { setActiveNode(null); setActiveBranch(null); }} className="text-navy-300 hover:text-navy-600 shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-semibold text-navy-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Skills needed
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {activeNode.skills.map(s => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-navy-50 text-navy-600 font-medium border border-navy-100">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-navy-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> First action
                  </p>
                  <p className="text-[11px] text-navy-700 leading-snug">
                    {activeNode.nextActions[activeNode.level] ?? activeNode.nextActions[0]}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Compact pathway cards below tree */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {pathways.map(p => {
          const Icon = iconMap[p.icon] || TrendingUp;
          const isRec = p.id === recommendedId;
          const active = activeBranch === p.id;
          return (
            <button
              key={p.id}
              onClick={() => { setActiveBranch(active ? null : p.id); setActiveNode(null); }}
              className="text-left rounded-xl border p-3 transition-all hover:shadow-sm"
              style={active ? { borderColor: p.color, backgroundColor: p.color + "08" } : { borderColor: "#e2e8f0", background: "white" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: p.color + "20" }}>
                  <Icon className="w-3 h-3" style={{ color: p.color }} />
                </div>
                <span className="text-xs font-semibold text-navy-900 flex-1">{p.name.replace(" Path", "")}</span>
                {isRec && <span className="text-[10px] text-gold-700 font-semibold flex items-center gap-0.5"><Star className="w-2.5 h-2.5 fill-current" /> Best</span>}
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
