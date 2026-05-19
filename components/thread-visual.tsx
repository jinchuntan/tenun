"use client";

import React from "react";
import { motion } from "framer-motion";

interface ThreadVisualProps {
  className?: string;
  variant?: "hero" | "background" | "small";
}

export function ThreadVisual({
  className = "",
  variant = "hero",
}: ThreadVisualProps) {
  const threads = [
    { color: "#4164b4", delay: 0 },
    { color: "#d4a017", delay: 0.3 },
    { color: "#6c5ce7", delay: 0.6 },
    { color: "#e17055", delay: 0.9 },
    { color: "#2d8a4e", delay: 1.2 },
    { color: "#c44569", delay: 1.5 },
  ];

  if (variant === "small") {
    return (
      <svg
        viewBox="0 0 120 60"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {threads.slice(0, 4).map((t, i) => (
          <motion.path
            key={i}
            d={`M 0 ${10 + i * 12} Q 30 ${5 + i * 10 + (i % 2) * 15} 60 ${15 + i * 10} T 120 ${12 + i * 11}`}
            stroke={t.color}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity={0.6}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: t.delay * 0.5, ease: "easeInOut" }}
          />
        ))}
      </svg>
    );
  }

  const size = variant === "hero" ? 600 : 400;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Nodes */}
      {[
        { cx: size * 0.2, cy: size * 0.3 },
        { cx: size * 0.5, cy: size * 0.15 },
        { cx: size * 0.8, cy: size * 0.25 },
        { cx: size * 0.15, cy: size * 0.65 },
        { cx: size * 0.5, cy: size * 0.5 },
        { cx: size * 0.85, cy: size * 0.6 },
        { cx: size * 0.35, cy: size * 0.85 },
        { cx: size * 0.65, cy: size * 0.8 },
      ].map((node, i) => (
        <motion.circle
          key={`node-${i}`}
          cx={node.cx}
          cy={node.cy}
          r={variant === "hero" ? 5 : 3}
          fill={threads[i % threads.length].color}
          opacity={0.7}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
        />
      ))}

      {/* Weaving threads */}
      {threads.map((t, i) => {
        const yBase = (size / (threads.length + 1)) * (i + 1);
        const amplitude = 30 + i * 8;
        return (
          <motion.path
            key={`thread-${i}`}
            d={`M 0 ${yBase} C ${size * 0.2} ${yBase - amplitude} ${size * 0.3} ${yBase + amplitude} ${size * 0.5} ${yBase} S ${size * 0.7} ${yBase - amplitude * 0.8} ${size} ${yBase + (i % 2 === 0 ? -15 : 15)}`}
            stroke={t.color}
            strokeWidth={variant === "hero" ? 2.5 : 1.5}
            strokeLinecap="round"
            opacity={0.35}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 2,
              delay: t.delay,
              ease: "easeInOut",
            }}
          />
        );
      })}

      {/* Cross-threads (weaving pattern) */}
      {[0, 1, 2, 3, 4].map((i) => {
        const x = (size / 6) * (i + 1);
        return (
          <motion.line
            key={`cross-${i}`}
            x1={x}
            y1={size * 0.1}
            x2={x + (i % 2 === 0 ? 20 : -20)}
            y2={size * 0.9}
            stroke={threads[i % threads.length].color}
            strokeWidth={1}
            opacity={0.15}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 1 + i * 0.2 }}
          />
        );
      })}
    </svg>
  );
}
