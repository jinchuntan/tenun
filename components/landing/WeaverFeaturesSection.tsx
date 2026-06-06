"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const FEATURE_MEDIA = [
  { image: "/images/landing/dog-image.png", alt: "Tenun mascot puppy exploring careers" },
  { image: "/images/landing/frog-image.png", alt: "Tenun mascot frog graduate thinking it through" },
  { image: "/images/landing/can-image.png", alt: "Tenun graduation-cap mascot striding ahead" },
];

const FEATURES_LEN = FEATURE_MEDIA.length;
const AUTO_ROTATE_MS = 4000;
const CARD_W = 300;
const CARD_GAP = 16;
const STEP = CARD_W + CARD_GAP;

export function WeaverFeaturesSection() {
  const { dict } = useLanguage();
  const f = dict.weaverFeatures;
  const FEATURES = f.cards.map((card, i) => ({ ...card, ...FEATURE_MEDIA[i] }));

  // Extended track: [last_clone, card0, card1, card2, first_clone]
  // trackIndex=1 is the real card0 start position
  const EXTENDED = [FEATURES[FEATURES_LEN - 1], ...FEATURES, FEATURES[0]];

  const [trackIndex, setTrackIndex] = useState(1);
  const [animDuration, setAnimDuration] = useState(0.5);
  const pausedRef = useRef(false);
  const isAnimating = useRef(false);

  const goNext = () => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    setTrackIndex((i) => i + 1);
  };

  const goPrev = () => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    setTrackIndex((i) => i - 1);
  };

  // After reaching a clone, instantly jump to the real equivalent card
  const handleAnimationComplete = () => {
    if (trackIndex === EXTENDED.length - 1) {
      setAnimDuration(0);
      setTrackIndex(1);
    } else if (trackIndex === 0) {
      setAnimDuration(0);
      setTrackIndex(FEATURES_LEN);
    } else {
      isAnimating.current = false;
    }
  };

  // Re-enable animation and unblock navigation after the instant jump
  useEffect(() => {
    if (animDuration === 0) {
      const raf = requestAnimationFrame(() => {
        setAnimDuration(0.5);
        isAnimating.current = false;
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [animDuration]);

  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current) goNext();
    }, AUTO_ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  const pause = () => { pausedRef.current = true; };
  const resume = () => { pausedRef.current = false; };

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

          {/* Carousel with flanking arrows */}
          <div className="lg:col-span-7 flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              aria-label={f.prev}
              className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full border border-beige-300 bg-white text-navy-700 hover:border-gold-400 hover:text-gold-600 hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div
              className="overflow-hidden flex-1"
              onMouseEnter={pause}
              onMouseLeave={resume}
              onTouchStart={pause}
              onTouchEnd={resume}
            >
              <motion.div
                className="flex"
                style={{ gap: CARD_GAP }}
                animate={{ x: -(trackIndex * STEP) }}
                transition={{ duration: animDuration, ease: "easeInOut" }}
                onAnimationComplete={handleAnimationComplete}
              >
                {EXTENDED.map((feature, i) => (
                  <article
                    key={i}
                    className="shrink-0 rounded-3xl bg-beige-100 border border-beige-300/60 p-[14px] flex flex-col shadow-lg shadow-navy-900/10 pt-8"
                    style={{ width: CARD_W, height: 474 }}
                  >
                    <div className="flex-1 flex flex-col justify-start">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="font-bold text-navy-900 text-xl leading-snug">
                          {feature.title}
                        </h3>
                        <ArrowUpRight className="w-6 h-6 text-navy-400 shrink-0 mt-0.5" />
                      </div>
                      <p className="text-base text-navy-600 leading-relaxed">
                        {feature.body}
                      </p>
                    </div>
                    <div className="flex-1 relative min-h-0 rounded-2xl bg-white overflow-hidden mt-1">
                      <Image
                        src={feature.image}
                        alt={feature.alt}
                        fill
                        sizes="468px"
                        className="object-contain p-4"
                      />
                    </div>
                  </article>
                ))}
              </motion.div>
            </div>

            <button
              type="button"
              onClick={goNext}
              aria-label={f.next}
              className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full border border-beige-300 bg-white text-navy-700 hover:border-gold-400 hover:text-gold-600 hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
