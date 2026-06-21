"use client";

import type { ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { fadeUp } from "@/lib/motion";

interface FadeInProps {
  children: ReactNode;
  /** Extra delay (seconds) before the reveal starts. */
  delay?: number;
  className?: string;
  /** Override the default fade-up variant (e.g. fadeIn). */
  variants?: Variants;
  /** Re-enter every time it scrolls into view instead of only once. */
  once?: boolean;
}

/**
 * Wrap anything to fade-and-rise as it scrolls into view, using the shared
 * `fadeUp` variant from lib/motion. Respects reduced-motion via the app-level
 * MotionConfig.
 */
export function FadeIn({
  children,
  delay = 0,
  className,
  variants = fadeUp,
  once = true,
}: FadeInProps) {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-80px" }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
