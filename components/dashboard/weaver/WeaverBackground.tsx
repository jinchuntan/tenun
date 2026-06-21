"use client";

import { motion } from "framer-motion";

/**
 * Branded, calm background for the Weaver dashboard.
 *
 * Four layers, all decorative (aria-hidden, pointer-events-none) and clipped
 * so they never cause horizontal overflow:
 *   1. warm ivory base (set by the shell)
 *   2. two low-opacity radial glows — muted gold (top-right) + soft navy
 *      (bottom-left), in the Tenun palette
 *   3. a faint tiled "woven thread" SVG pattern (~6–9% opacity) evoking
 *      career paths being woven together
 *   4. a handful of long threads that slowly "weave" — a drawn dash flows
 *      along each curve on a loop (pathLength + animated pathOffset), so the
 *      mesh feels alive without ever erasing or distracting from the cards.
 *
 * Only `pathOffset`/`opacity` animate (GPU-cheap); honours reduced-motion via
 * the app-level MotionConfig.
 */

// Long, gently weaving S-curves spanning the full width, each in the brand
// palette. `delay` staggers the flow so they don't pulse in lockstep.
const THREADS = [
  { d: "M-40,150 C 320,40 520,300 840,170 S 1180,40 1320,180", color: "rgba(212,160,23,0.55)", delay: 0 },
  { d: "M-40,360 C 280,250 560,470 880,340 S 1160,230 1320,380", color: "rgba(10,22,40,0.40)", delay: 2.1 },
  { d: "M-40,560 C 340,460 540,700 860,580 S 1180,470 1320,600", color: "rgba(212,160,23,0.45)", delay: 4.2 },
];

export function WeaverBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Radial brand glows — kept very soft so cards stay readable. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            // muted gold glow, top-right
            "radial-gradient(55rem 38rem at 90% 6%, rgba(212,160,23,0.16), transparent 60%)",
            // soft navy glow, bottom-left
            "radial-gradient(52rem 42rem at 6% 94%, rgba(10,22,40,0.10), transparent 60%)",
          ].join(", "),
        }}
      />

      {/* Woven-thread pattern — interlacing curves tiled at low opacity. */}
      <svg
        className="absolute inset-0 h-full w-full text-[#0a1628] opacity-[0.06] sm:opacity-[0.08]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="weaver-thread"
            width="160"
            height="160"
            patternUnits="userSpaceOnUse"
          >
            {/* Two seamless S-curves (one horizontal, one vertical) cross to
                form a continuous woven mesh when tiled. */}
            <path
              d="M0,80 C53,30 107,130 160,80"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
            <path
              d="M80,0 C30,53 130,107 80,160"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#weaver-thread)" />
      </svg>

      {/* Living weave — a short lit segment flows along each long thread. */}
      <svg
        className="absolute inset-0 h-full w-full opacity-50 sm:opacity-60"
        viewBox="0 0 1280 720"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {THREADS.map((t, i) => (
          <motion.path
            key={i}
            d={t.d}
            fill="none"
            stroke={t.color}
            strokeWidth={2}
            strokeLinecap="round"
            style={{ pathLength: 0.35 }}
            initial={{ pathOffset: 0, opacity: 0 }}
            animate={{ pathOffset: [0, 1], opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 9,
              delay: t.delay,
              repeat: Infinity,
              ease: "linear",
              opacity: { duration: 9, delay: t.delay, repeat: Infinity, times: [0, 0.1, 0.9, 1] },
            }}
          />
        ))}
      </svg>
    </div>
  );
}
