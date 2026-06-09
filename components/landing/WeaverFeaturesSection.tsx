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

const SWIPE_DISTANCE = 55;
const SWIPE_VELOCITY = 350;

type Pos = -1 | 0 | 1;

export function WeaverFeaturesSection() {
  const { dict } = useLanguage();
  const f = dict.weaverFeatures;
  const reduce = useReducedMotion();

  const FEATURES = f.cards.map((card, i) => ({ ...card, ...FEATURE_MEDIA[i] }));

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const pause = useCallback(() => setPaused(true), []);
  const resume = useCallback(() => setPaused(false), []);

  const goNext = useCallback(() => setIndex((i) => (i + 1) % LEN), []);
  const goPrev = useCallback(() => setIndex((i) => (i - 1 + LEN) % LEN), []);
  const goTo = useCallback((t: number) => setIndex(((t % LEN) + LEN) % LEN), []);

  // Self-resetting timer: re-armed on every index change, cleared while paused/reduced-motion.
  useEffect(() => {
    if (reduce || paused) return;
    const id = setTimeout(goNext, AUTO_ROTATE_MS);
    return () => clearTimeout(id);
  }, [index, paused, reduce, goNext]);

  // ResizeObserver so fan offsets scale with available container width.
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
    const dir = pos;
    return { x: dir * sideX, y: sideY, rotate: dir * sideRotate, scale: sideScale, opacity: sideOpacity, zIndex: pos === 1 ? 20 : 10 };
  };

  const transition = { duration: reduce ? 0 : 0.4, ease: "easeInOut" };

  function handleDragEnd(_: unknown, info: PanInfo) {
    const dist = info.offset.x;
    const vel = info.velocity.x;
    if (dist < -SWIPE_DISTANCE || vel < -SWIPE_VELOCITY) goNext();
    else if (dist > SWIPE_DISTANCE || vel > SWIPE_VELOCITY) goPrev();
  }

  return (
    <section id="features" className="py-6 md:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
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

          {/* Fan carousel with controls */}
          <div className="lg:col-span-7">
            <div
              ref={fanRef}
              className="relative h-[400px] sm:h-[430px] lg:h-[450px] mb-6"
              onMouseEnter={pause}
              onFocus={pause}
              onMouseLeave={resume}
              onBlur={resume}
            >
              {FEATURES.map((feature, i) => {
                const rel = (i - index + LEN) % LEN;
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
                    className={[
                      "absolute inset-0 m-auto h-[400px] sm:h-[430px] lg:h-[450px]",
                      "flex flex-col rounded-3xl bg-beige-100 border border-beige-300/60 p-3.5 pt-7 shadow-xl shadow-navy-900/10",
                      isCenter ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
                    ].join(" ")}
                    {...(isCenter
                      ? { drag: "x" as const, dragConstraints: { left: 0, right: 0 }, dragElastic: 0.18, dragMomentum: false, onDragStart: pause, onDragEnd: handleDragEnd }
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

            {/* Controls — arrows flanking dot indicators */}
            <div className="flex items-center justify-center gap-4">
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
                    className={["h-2 rounded-full transition-all", i === index ? "w-6 bg-navy-700" : "w-2 bg-beige-300 hover:bg-navy-300"].join(" ")}
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
