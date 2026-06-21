"use client";

import { motion } from "framer-motion";

/**
 * Animated aurora / mesh-gradient background — a handful of large, heavily
 * blurred colour blobs that slowly drift and blend, "weaving" colour instead of
 * lines. Decorative (aria-hidden, pointer-events-none) and clipped.
 *
 * Only each blob's transform animates (GPU-cheap); the blur is static. A warm
 * ivory radial scrim keeps the centred hero text legible over the colour, and
 * the whole thing honours reduced-motion via the app-level MotionConfig.
 */

type Blob = {
  color: string;
  size: number;
  top: string;
  left: string;
  x: number[];
  y: number[];
  duration: number;
};

const BLOBS: Blob[] = [
  { color: "rgba(124,92,255,0.55)", size: 520, top: "-12%", left: "-6%", x: [0, 60, -30, 0], y: [0, 50, 90, 0], duration: 19 },
  { color: "rgba(45,212,191,0.50)", size: 480, top: "12%", left: "58%", x: [0, -60, 40, 0], y: [0, 70, -30, 0], duration: 23 },
  { color: "rgba(244,114,182,0.48)", size: 440, top: "48%", left: "8%", x: [0, 80, -50, 0], y: [0, -60, 40, 0], duration: 21 },
  { color: "rgba(59,130,246,0.46)", size: 500, top: "-18%", left: "62%", x: [0, -50, 60, 0], y: [0, 60, 20, 0], duration: 25 },
  { color: "rgba(212,160,23,0.42)", size: 420, top: "52%", left: "66%", x: [0, 40, -70, 0], y: [0, -50, 50, 0], duration: 27 },
];

export function AuroraBackground({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {BLOBS.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: b.size,
            height: b.size,
            top: b.top,
            left: b.left,
            background: `radial-gradient(circle at center, ${b.color}, transparent 70%)`,
            filter: "blur(64px)",
            willChange: "transform",
          }}
          animate={{ x: b.x, y: b.y, scale: [1, 1.15, 0.95, 1] }}
          transition={{
            duration: b.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.6,
          }}
        />
      ))}

      {/* Legibility scrim — warm ivory glow brightest in the centre, where the
          hero headline sits, fading out toward the colourful edges. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 45%, rgba(247,243,234,0.72), rgba(247,243,234,0.30) 60%, transparent 100%)",
        }}
      />
    </div>
  );
}
