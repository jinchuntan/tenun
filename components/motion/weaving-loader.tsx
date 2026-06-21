"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ease } from "@/lib/motion";

interface WeavingLoaderProps {
  /** Ordered step labels, revealed one at a time (e.g. dict.cvUpload.parsingSteps). */
  steps: string[];
  /** Time each step is shown before advancing (ms). */
  interval?: number;
}

/**
 * Progressive-disclosure loader for indeterminate waits: cycles through a few
 * short "the product is thinking" steps next to a continuously weaving thread
 * mark, instead of a bare spinner. Advances through the steps and holds on the
 * last one until it unmounts.
 */
export function WeavingLoader({ steps, interval = 1600 }: WeavingLoaderProps) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (i >= steps.length - 1) return;
    const id = setTimeout(() => setI((p) => p + 1), interval);
    return () => clearTimeout(id);
  }, [i, steps.length, interval]);

  return (
    <div className="flex items-center justify-center gap-3 py-10">
      {/* Continuously weaving thread mark — two S-curves drawing on a loop,
          echoing the dashboard's woven-thread motif. */}
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden
        className="flex-shrink-0 text-gold-500"
      >
        {[0, 0.7].map((delay, idx) => (
          <motion.path
            key={idx}
            d={
              idx === 0
                ? "M2,14 C9,5 19,23 26,14"
                : "M14,2 C5,9 23,19 14,26"
            }
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.2 }}
            animate={{ pathLength: [0, 1, 0], opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 2.2, ease, repeat: Infinity, delay }}
          />
        ))}
      </svg>

      <AnimatePresence mode="wait">
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease }}
          className="text-sm text-navy-600"
        >
          {steps[i]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
