"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface HeroSectionProps {
  query: string;
  setQuery: (v: string) => void;
  loading: boolean;
  hasResult: boolean;
  onSearch: (q?: string) => void;
  examples: string[];
}

// Single word with no spaces = likely a broad/generic query
const isGenericQuery = (q: string) => q.trim().length > 0 && !q.trim().includes(" ");

export function HeroSection({
  query, setQuery, loading, hasResult, onSearch, examples,
}: HeroSectionProps) {
  const { dict, locale } = useLanguage();
  const h = dict.home;
  const gamesQuery = locale === "ms" ? `Saya nak ${query} permainan` : locale === "zh-CN" ? `我想${query}游戏` : `I want to ${query} games`;
  return (
    <section
      className="relative pt-10 pb-12 md:pt-12 md:pb-16 overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <div className="absolute inset-0 dot-pattern opacity-[0.35] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <motion.h1
          id="hero-heading"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="font-display text-[2.5rem] leading-[0.95] sm:text-5xl lg:text-[3.5rem] xl:text-6xl tracking-tight text-navy-900 mb-5 lg:whitespace-nowrap"
        >
          {h.heroTitleLine1}
          <br />
          {h.heroTitleLine2}
          <br />
          <span className="gradient-gold">{h.heroTitleLine3}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-base sm:text-lg text-navy-600 mb-8 max-w-xl mx-auto leading-relaxed"
        >
          {h.heroSubtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <form
            id="hero-search"
            onSubmit={(e) => { e.preventDefault(); onSearch(); }}
            className="relative max-w-2xl mx-auto scroll-mt-28"
          >
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={h.searchPlaceholder}
              className="w-full pr-32 py-5 rounded-full border border-beige-300 bg-white/90 text-sm sm:text-base text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-4 focus:ring-gold-500/15 focus:border-gold-400 transition-all shadow-lg shadow-navy-900/5"
              style={{ paddingLeft: "3.25rem" }}
              aria-label={h.searchAria}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-5 py-3 rounded-full bg-navy-900 text-white text-sm font-semibold hover:bg-gold-500 hover:text-navy-900 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-navy-900 disabled:hover:text-white transition-all"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> {h.weaving}</>
                : <>{h.explore}</>}
            </button>
          </form>

          {/* Single-word hint */}
          <AnimatePresence>
            {isGenericQuery(query) && !loading && !hasResult && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-navy-400 mt-3 text-center"
              >
                {h.tip}{" "}
                <button
                  onClick={() => onSearch(gamesQuery)}
                  className="text-navy-700 underline underline-offset-2 hover:text-navy-900"
                >
                  &ldquo;{gamesQuery}&rdquo;
                </button>
              </motion.p>
            )}
          </AnimatePresence>

          <div
            className="flex flex-wrap justify-center gap-2.5 mt-6 max-w-xl mx-auto"
            role="list"
            aria-label="Example searches"
          >
            {examples.map((q) => (
              <button
                key={q}
                role="listitem"
                onClick={() => onSearch(q)}
                className="text-xs sm:text-sm px-4 py-2 rounded-full border border-beige-300 bg-white/70 text-navy-700 hover:border-gold-400 hover:bg-white hover:shadow-sm transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
