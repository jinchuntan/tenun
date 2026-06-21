"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { ease } from "@/lib/motion";

interface CounterProps {
  /** Target number to count up to. */
  to: number;
  /** Animation length in seconds. */
  duration?: number;
  /** Text appended after the number, e.g. "%", " sec". */
  suffix?: string;
  /** Text shown before the number. */
  prefix?: string;
  className?: string;
}

/**
 * Counts up from 0 to `to` the first time it scrolls into view. Respects
 * reduced-motion via the app-level MotionConfig (the animation simply resolves
 * instantly when motion is reduced).
 */
export function Counter({
  to,
  duration = 1.4,
  suffix = "",
  prefix = "",
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    if (inView) {
      const controls = animate(count, to, { duration, ease });
      return controls.stop;
    }
  }, [inView, to, duration, count]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}
