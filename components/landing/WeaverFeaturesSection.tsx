"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, useReducedMotion, type PanInfo } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const FEATURE_MEDIA = [
  { image: "/images/landing/dog-image.png", alt: "Tenun mascot puppy exploring careers" },
  { image: "/images/landing/frog-image.png", alt: "Tenun mascot frog graduate thinking it through" },
  { image: "/images/landing/can-image.png", alt: "Tenun graduation-cap mascot striding ahead" },
];

const LEN = FEATURE_MEDIA.length;
const AUTO_ROTATE_MS = 5000;

// Swipe commits when the drag passes EITHER a distance OR a velocity gate.
const SWIPE_DISTANCE = 55; // px
const SWIPE_VELOCITY = 350; // px/s

type Pos = -1 | 0 | 1;

export function WeaverFeaturesSection() {
  const { dict } = useLanguage();
  const f = dict.weaverFeatures;
  const reduce = useReducedMotion();

  const FEATURES = f.cards.map((card, i) => ({ ...card, ...FEATURE_MEDIA[i] }));

  const [index, setIndex] = useState(0);

  // Pauses auto-rotation while the user hovers / focuses / drags / touches.
  const interactingRef = useRef(false);
  const pause = useCallback(() => { interactingRef.current = true; }, []);
  const resume = useCallback(() => { interactingRef.current = false; }, []);

  const goNext = useCallback(() => setIndex((i) => (i + 1) % LEN), []);
  const goPrev = useCallback(() => setIndex((i) => (i - 1 + LEN) % LEN), []);
  const goTo = useCallback((t: number) => setIndex(((t % LEN) + LEN) % LEN), []);

  // Auto-rotation (skipped when the user prefers reduced motion).
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      if (!interactingRef.current) goNext();
    }, AUTO_ROTATE_MS);
    return () => clearInterval(id);
  }, [goNext, reduce]);

  // Measure the fan width so the side-card offsets scale with available space.
  const fanRef = useRef<HTMLDivElement>(null);
  const [fanW, setFanW] = useState(360);
  useEffect(() => {
    const el = fanRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => setFanW(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const desktop = fanW >= 600;
  const sideX = desktop ? Math.min(fanW * 0.26, 172) : Math.max(fanW * 0.12, 30);
  const sideY = desktop ? 20 : 14;
  const sideScale = desktop ? 0.9 : 0.84;
  const sideRotate = desktop ? 7 : 6;
  const sideOpacity = desktop ? 0.96 : 0.82;

  const targetFor = (pos: Pos) => {
    if (pos === 0) return { x: 0, y: 0, rotate: 0, scale: 1.03, opacity: 1, zIndex: 30 };
    const dir = pos; // -1 left, 1 right
    return {
      x: dir * sideX,
      y: sideY,
      rotate: dir * sideRotate,
      scale: sideScale,
      opacity: sideOpacity,
      zIndex: pos === 1 ? 20 : 10,
    };
  };

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const { offset, velocity } = info;
      if (offset.x < -SWIPE_DISTANCE || velocity.x < -SWIPE_VELOCITY) goNext();
      else if (offset.x > SWIPE_DISTANCE || velocity.x > SWIPE_VELOCITY) goPrev();
      resume();
    },
    [goNext, goPrev, resume]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); goNext(); }
    },
    [goNext, goPrev]
  );

  const transition = reduce
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 260, damping: 30 };

  return (
    <section id="features" className="py-6 md:py-10 overflow-x-clip">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-8 items-center">
          {/* Left headline */}
          <div className="lg:col-span-5">
            <p className="text-sm font-semibold text-navy-500 mb-3">{f.eyebrow}</p>
            <h2 className="font-display text-3xl sm:text-4xl text-navy-900 leading-[1.05] mb-6">
              {f.title}
            </h2>
            <p className="text-sm text-navy-600 leading-relaxed underline decoration-gold-400 decoration-2 underline-offset-4 max-w-sm mb-8">
              {f.subtitle}
            </p>
          </div>

          {/* Card fan */}
          <div
            className="lg:col-span-7 select-none"
            role="group"
            aria-roledescription="carousel"
            aria-label={f.title}
            onMouseEnter={pause}
            onMouseLeave={resume}
            onTouchStart={pause}
            onTouchEnd={resume}
            onFocus={pause}
            onBlur={resume}
          >
            <div
              ref={fanRef}
              tabIndex={0}
              onKeyDown={handleKeyDown}
              aria-label={`${FEATURES[index].title} — ${index + 1} of ${LEN}`}
              className="relative w-full h-[440px] sm:h-[480px] lg:h-[500px] outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-beige-50 rounded-3xl"
            >
              {FEATURES.map((feature, i) => {
                const rel = (i - index + LEN) % LEN; // 0 center, 1 right, 2 left
                const pos: Pos = rel === 0 ? 0 : rel === 1 ? 1 : -1;
                const isCenter = pos === 0;

                return (
                  <motion.article
                    key={i}
                    aria-hidden={!isCenter}
                    initial={false}
                    animate={targetFor(pos)}
                    transition={transition}
                    style={{ width: "min(80vw, 300px)" }}
                    // Centred via inset-0 + m-auto; Framer transforms ride on top.
                    className={[
                      "absolute inset-0 m-auto h-[400px] sm:h-[430px] lg:h-[450px]",
                      "flex flex-col rounded-3xl bg-beige-100 border border-beige-300/60 p-3.5 pt-7 shadow-xl shadow-navy-900/10",
                      isCenter ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
                    ].join(" ")}
                    {...(isCenter
                      ? {
                          drag: "x" as const,
                          dragConstraints: { left: 0, right: 0 },
                          dragElastic: 0.18,
                          dragMomentum: false,
                          onDragStart: pause,
                          onDragEnd: handleDragEnd,
                        }
                      : { onClick: () => goTo(i) })}
                  >
                    <div className="px-1">
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <h3 className="font-bold text-navy-900 text-base sm:text-lg lg:text-xl leading-snug">
                          {feature.title}
                        </h3>
                        <ArrowUpRight className="w-5 h-5 lg:w-6 lg:h-6 text-navy-400 shrink-0 mt-0.5" />
                      </div>
                      <p className="text-xs sm:text-sm text-navy-600 leading-relaxed">
                        {feature.body}
                      </p>
                    </div>

                    <div className="flex-1 relative min-h-0 rounded-2xl bg-white overflow-hidden mt-3">
                      <Image
                        src={feature.image}
                        alt={feature.alt}
                        fill
                        sizes="(max-width: 640px) 80vw, 300px"
                        className="object-contain p-3 sm:p-4 pointer-events-none"
                        draggable={false}
                        priority={i === 0}
                      />
                    </div>
                  </motion.article>
                );
              })}
            </div>

            {/* Controls — arrows flanking the dots, below the fan */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                type="button"
                onClick={goPrev}
                aria-label={f.prev}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-beige-300 bg-white text-navy-700 hover:border-gold-400 hover:text-gold-600 transition-colors shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                {FEATURES.map((feature, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Show feature ${i + 1}: ${feature.title}`}
                    aria-current={i === index}
                    className={[
                      "h-2 rounded-full transition-all",
                      i === index ? "w-6 bg-navy-700" : "w-2 bg-beige-300 hover:bg-navy-300",
                    ].join(" ")}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={goNext}
                aria-label={f.next}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-beige-300 bg-white text-navy-700 hover:border-gold-400 hover:text-gold-600 transition-colors shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
