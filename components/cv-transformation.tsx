"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import { ArrowRight, MoveHorizontal } from "lucide-react";

const CALLOUTS = [
  {
    stat: "7 sec",
    label: "average recruiter scan time",
    body: "Numbers and keywords are the only things that stop the scroll. Generic descriptions get skipped instantly.",
  },
  {
    stat: "85%",
    label: "of CVs rejected by ATS before a human reads them",
    body: "Tenun matches your skills to exactly what each company's system scans for — so you actually get seen.",
  },
  {
    stat: "3x",
    label: "more callbacks with a targeted summary",
    body: "Your opening line should answer one question: why should I keep reading?",
  },
  {
    stat: "91%",
    label: "of recruiters verify candidates online",
    body: "LinkedIn and GitHub signal confidence and make their job easier. Adding them takes 10 seconds.",
  },
];

// ── Highlight overlay component ──────────────────────────────────────────

function Highlight({
  color,
  top,
  left,
  width,
  height,
  label,
}: {
  color: "red" | "green";
  top: string;
  left: string;
  width: string;
  height: string;
  label: string;
}) {
  const isRed = color === "red";
  return (
    <div
      className="absolute pointer-events-none"
      style={{ top, left, width, height }}
    >
      {/* Coloured fill */}
      <div
        className={`absolute inset-0 rounded-sm border-2 ${
          isRed
            ? "bg-red-400/20 border-red-500"
            : "bg-emerald-400/20 border-emerald-500"
        }`}
      />
      {/* Label badge — top right */}
      <span
        className={`absolute -top-5 right-0 text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${
          isRed
            ? "bg-red-500 text-white"
            : "bg-emerald-500 text-white"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

// ── Desktop: scroll-driven image divider ─────────────────────────────────

function DesktopDivider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [calloutIndex, setCalloutIndex] = useState(0);
  const [showCta, setShowCta] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // divider moves 0 → 100% as you scroll
  const dividerPercent = useTransform(scrollYProgress, [0.05, 0.95], [0, 100], {
    clamp: true,
  });

  // good image clip: reveals from left as divider moves right
  const goodClip = useTransform(
    dividerPercent,
    (v) => `inset(0 ${100 - v}% 0 0)`
  );

  const dividerLeft = useTransform(dividerPercent, (v) => `${v}%`);

  const beforeOpacity = useTransform(dividerPercent, [0, 35], [1, 0]);
  const afterOpacity  = useTransform(dividerPercent, [15, 60], [0, 1]);

  useMotionValueEvent(dividerPercent, "change", (v) => {
    const idx = Math.min(
      Math.floor((v / 100) * CALLOUTS.length),
      CALLOUTS.length - 1
    );
    setCalloutIndex(idx);
    setShowCta(v > 88);
  });

  return (
    <div ref={containerRef} className="relative" style={{ height: "550vh" }}>
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-[1fr_360px] gap-12 items-center">

            {/* Image comparison */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-navy-100 select-none w-4/5 mx-auto">

              {/* Labels */}
              <div className="absolute top-3 left-3 right-3 flex justify-between z-20 pointer-events-none">
                <motion.span
                  style={{ opacity: beforeOpacity }}
                  className="px-3 py-1 bg-red-500 text-white text-xs font-bold uppercase tracking-widest rounded-lg shadow"
                >
                  Before
                </motion.span>
                <motion.span
                  style={{ opacity: afterOpacity }}
                  className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest rounded-lg shadow"
                >
                  After
                </motion.span>
              </div>

              {/* Bad resume — base layer */}
              <div className="relative">
                <Image
                  src="/images/bad.png"
                  alt="Resume before Tenun"
                  width={900}
                  height={1200}
                  className="w-full h-auto block"
                  priority
                  unoptimized
                />
                {/* Red highlights on bad resume */}
                <Highlight color="red" top="13%" left="4%" width="55%" height="4.5%" label="Missing LinkedIn & GitHub" />
                <Highlight color="red" top="22%" left="4%" width="88%" height="7%" label="Generic objective" />
                <Highlight color="red" top="48%" left="4%" width="75%" height="5%" label="No metrics" />
                <Highlight color="red" top="68%" left="4%" width="80%" height="4.5%" label="Soft skills only" />
              </div>

              {/* Good resume — clipped layer on top */}
              <motion.div
                className="absolute inset-0"
                style={{ clipPath: goodClip }}
              >
                <div className="relative">
                  <Image
                    src="/images/good.png"
                    alt="Resume after Tenun"
                    width={900}
                    height={1200}
                    className="w-full h-auto block"
                    priority
                    unoptimized
                  />
                  {/* Green highlights on good resume */}
                  <Highlight color="green" top="13%" left="4%" width="70%" height="4.5%" label="Full profile" />
                  <Highlight color="green" top="22%" left="4%" width="88%" height="7%" label="Targeted summary" />
                  <Highlight color="green" top="48%" left="4%" width="75%" height="5%" label="Quantified impact" />
                  <Highlight color="green" top="68%" left="4%" width="80%" height="4.5%" label="ATS keywords" />
                </div>
              </motion.div>

              {/* Divider line */}
              <motion.div
                className="absolute top-0 bottom-0 w-[2px] bg-navy-900 z-10"
                style={{ left: dividerLeft }}
              >
                {/* Handle */}
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-[15px] w-[30px] h-[30px] bg-navy-900 rounded-full flex items-center justify-center shadow-lg">
                  <MoveHorizontal className="w-3.5 h-3.5 text-white" />
                </div>
              </motion.div>
            </div>

            {/* Callout */}
            <div>
              {/* Static headline — stays while stats rotate */}
              <div className="mb-8">
                <p className="text-4xl sm:text-5xl font-black text-navy-900 leading-tight mb-3">
                  Don&apos;t stress.{" "}
                  <span className="gradient-text">We&apos;ve got you.</span>
                </p>
                <p className="text-sm text-navy-500 leading-relaxed max-w-xs">
                  Most people don&apos;t know where to start — and that&apos;s completely
                  fine. We build your CV with you, keep it sharp as you grow,
                  and make sure you&apos;re always ready when the right door opens.
                </p>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={calloutIndex}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  <div className="text-5xl font-black text-navy-900 leading-none">
                    {CALLOUTS[calloutIndex].stat}
                  </div>
                  <p className="text-xs text-navy-400 font-medium leading-snug">
                    {CALLOUTS[calloutIndex].label}
                  </p>
                  <p className="text-sm text-navy-600 leading-relaxed pt-1 border-t border-navy-100">
                    {CALLOUTS[calloutIndex].body}
                  </p>

                  {/* Progress */}
                  <div className="flex gap-1.5 pt-2">
                    {CALLOUTS.map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          width: i === calloutIndex ? 20 : 6,
                          backgroundColor:
                            i <= calloutIndex ? "#10b981" : "#e2e8f0",
                        }}
                        transition={{ duration: 0.3 }}
                        className="h-1.5 rounded-full"
                      />
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              <AnimatePresence>
                {showCta && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-8 pt-6 border-t border-navy-100"
                  >
                    <p className="text-sm font-bold text-navy-900 mb-1">
                      Ready to build yours?
                    </p>
                    <p className="text-xs text-navy-500 mb-4">
                      Free for Weavers. No credit card required.
                    </p>
                    <Link
                      href="/profile"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-800 text-white rounded-xl text-sm font-semibold hover:bg-navy-700 transition-all"
                    >
                      Build my CV <ArrowRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// ── Mobile: swipe toggle ──────────────────────────────────────────────────

function MobileComparison() {
  const [showGood, setShowGood] = useState(false);

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="flex rounded-xl overflow-hidden border border-navy-200 mb-5">
        <button
          onClick={() => setShowGood(false)}
          className={`flex-1 py-2.5 text-sm font-semibold transition-all ${
            !showGood ? "bg-red-500 text-white" : "bg-white text-navy-500"
          }`}
        >
          Before
        </button>
        <button
          onClick={() => setShowGood(true)}
          className={`flex-1 py-2.5 text-sm font-semibold transition-all ${
            showGood ? "bg-emerald-500 text-white" : "bg-white text-navy-500"
          }`}
        >
          After
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={showGood ? "good" : "bad"}
          initial={{ opacity: 0, x: showGood ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: showGood ? -20 : 20 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl overflow-hidden border border-navy-100 shadow-lg"
        >
          <Image
            src={showGood ? "/images/good.png" : "/images/bad.png"}
            alt={showGood ? "Resume after Tenun" : "Resume before Tenun"}
            width={900}
            height={1200}
            className="w-full h-auto"
            unoptimized
          />
        </motion.div>
      </AnimatePresence>

      <div className="text-center mt-6">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-800 text-white rounded-xl text-sm font-semibold hover:bg-navy-700 transition-all"
        >
          Build my CV <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

// ── Export ────────────────────────────────────────────────────────────────

export function CvTransformation() {
  return (
    <section className="bg-white border-t border-navy-100">

      <div className="hidden md:block">
        <DesktopDivider />
      </div>

      <div className="md:hidden">
        <MobileComparison />
      </div>
    </section>
  );
}
