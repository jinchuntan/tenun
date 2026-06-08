"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion, type PanInfo } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const FEATURE_MEDIA = [
  { image: "/images/landing/dog-image.png", alt: "Tenun mascot puppy exploring careers" },
  { image: "/images/landing/frog-image.png", alt: "Tenun mascot frog graduate thinking it through" },
  { image: "/images/landing/can-image.png", alt: "Tenun graduation-cap mascot striding ahead" },
];

const LEN = FEATURE_MEDIA.length;
const AUTO_ROTATE_MS = 5000;

// Swipe is committed when the drag passes EITHER a distance OR a velocity gate.
const SWIPE_DISTANCE = 60; // px
const SWIPE_VELOCITY = 400; // px/s

// Slide variants — direction-aware so "next" always travels the same way.
const variants = {
  enter: (dir: number) => ({ x: dir >= 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: "0%", opacity: 1 },
  exit: (dir: number) => ({ x: dir >= 0 ? "-100%" : "100%", opacity: 0 }),
};

export function WeaverFeaturesSection() {
  const { dict } = useLanguage();
  const f = dict.weaverFeatures;
  const reduce = useReducedMotion();

  const FEATURES = f.cards.map((card, i) => ({ ...card, ...FEATURE_MEDIA[i] }));

  // `page` is unbounded; the visible card is page mod LEN. This loops logically
  // in both directions without clones, and keeps slide direction consistent.
  const [[page, direction], setPage] = useState<[number, number]>([0, 0]);
  const index = ((page % LEN) + LEN) % LEN;

  // Pauses auto-rotation while the user hovers / focuses / drags / touches.
  const interactingRef = useRef(false);
  const pause = useCallback(() => { interactingRef.current = true; }, []);
  const resume = useCallback(() => { interactingRef.current = false; }, []);

  const paginate = useCallback((dir: number) => {
    setPage(([p]) => [p + dir, dir]);
  }, []);
  const goNext = useCallback(() => paginate(1), [paginate]);
  const goPrev = useCallback(() => paginate(-1), [paginate]);

  const goTo = useCallback((target: number) => {
    setPage(([p]) => {
      const current = ((p % LEN) + LEN) % LEN;
      if (target === current) return [p, 0];
      return [p + (target - current), target > current ? 1 : -1];
    });
  }, []);

  // Auto-rotation (skipped entirely when the user prefers reduced motion).
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      if (!interactingRef.current) goNext();
    }, AUTO_ROTATE_MS);
    return () => clearInterval(id);
  }, [goNext, reduce]);

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const { offset, velocity } = info;
      if (offset.x < -SWIPE_DISTANCE || velocity.x < -SWIPE_VELOCITY) goNext();
      else if (offset.x > SWIPE_DISTANCE || velocity.x > SWIPE_VELOCITY) goPrev();
      // Small drag → AnimatePresence/drag elastic snaps the card back to center.
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
    : { x: { type: "spring", stiffness: 320, damping: 34 }, opacity: { duration: 0.25 } };

  const active = FEATURES[index];

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

          {/* Carousel */}
          <div className="lg:col-span-7">
            <div
              className="relative w-full max-w-[420px] mx-auto select-none"
              role="group"
              aria-roledescription="carousel"
              aria-label={f.title}
              onMouseEnter={pause}
              onMouseLeave={resume}
              onFocus={pause}
              onBlur={resume}
              onTouchStart={pause}
              onTouchEnd={resume}
            >
              {/* Viewport — fixed responsive height so sliding cards never
                  collapse the layout, overflow-hidden so neighbours stay clipped
                  cleanly inside the rounded frame. */}
              <div
                className="relative h-[460px] sm:h-[480px] lg:h-[500px] overflow-hidden rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-beige-100"
                tabIndex={0}
                onKeyDown={handleKeyDown}
                aria-label={`${active.title} — ${index + 1} / ${LEN}`}
              >
                <AnimatePresence initial={false} custom={direction}>
                  <motion.article
                    key={page}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={transition}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.18}
                    dragMomentum={false}
                    onDragStart={pause}
                    onDragEnd={handleDragEnd}
                    className="absolute inset-0 flex flex-col rounded-3xl bg-beige-100 border border-beige-300/60 p-3.5 pt-7 shadow-lg shadow-navy-900/10 cursor-grab active:cursor-grabbing"
                  >
                    <div className="px-1">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="font-bold text-navy-900 text-lg sm:text-xl leading-snug">
                          {active.title}
                        </h3>
                        <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 text-navy-400 shrink-0 mt-0.5" />
                      </div>
                      <p className="text-sm sm:text-base text-navy-600 leading-relaxed">
                        {active.body}
                      </p>
                    </div>

                    <div className="flex-1 relative min-h-0 rounded-2xl bg-white overflow-hidden mt-3">
                      <Image
                        src={active.image}
                        alt={active.alt}
                        fill
                        sizes="(max-width: 640px) 90vw, 420px"
                        className="object-contain p-4 pointer-events-none"
                        draggable={false}
                      />
                    </div>
                  </motion.article>
                </AnimatePresence>
              </div>

              {/* Arrows — overlaid so they never shift the layout */}
              <button
                type="button"
                onClick={goPrev}
                aria-label={f.prev}
                className="absolute left-1 sm:-left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-beige-300 bg-white/90 backdrop-blur text-navy-700 hover:border-gold-400 hover:text-gold-600 transition-colors shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label={f.next}
                className="absolute right-1 sm:-right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-beige-300 bg-white/90 backdrop-blur text-navy-700 hover:border-gold-400 hover:text-gold-600 transition-colors shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Dots */}
            <div className="flex items-center justify-center gap-2 mt-5">
              {FEATURES.map((feature, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to: ${feature.title}`}
                  aria-current={i === index}
                  className={[
                    "h-2 rounded-full transition-all",
                    i === index ? "w-6 bg-navy-700" : "w-2 bg-beige-300 hover:bg-navy-300",
                  ].join(" ")}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
