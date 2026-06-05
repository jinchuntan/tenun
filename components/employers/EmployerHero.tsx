"use client";

import { motion } from "framer-motion";
import { Search, ArrowRight, LayoutDashboard } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface EmployerHeroProps {
  roleTitle: string;
  setRoleTitle: (v: string) => void;
  onFindCandidates: () => void;
  onPostRole: () => void;
  onViewPreview: () => void;
}

export function EmployerHero({
  roleTitle, setRoleTitle, onFindCandidates, onPostRole, onViewPreview,
}: EmployerHeroProps) {
  const { dict } = useLanguage();
  const e = dict.employerHero;
  return (
    <section
      className="relative pt-10 pb-12 md:pt-12 md:pb-16 overflow-hidden"
      aria-labelledby="employer-hero-heading"
    >
      <div className="absolute inset-0 dot-pattern opacity-[0.35] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-beige-300 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-navy-600 mb-6"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
          {e.badge}
        </motion.span>

        <motion.h1
          id="employer-hero-heading"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="font-display text-[2.5rem] leading-[0.98] sm:text-5xl lg:text-6xl tracking-tight text-navy-900 mb-5"
        >
          {e.titlePrefix}
          <br className="hidden sm:block" />{" "}
          <span className="gradient-gold">{e.titleHighlight}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-base sm:text-lg text-navy-600 mb-8 max-w-2xl mx-auto leading-relaxed"
        >
          {e.subtitle}
        </motion.p>

        {/* Role input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <form
            onSubmit={(e) => { e.preventDefault(); onFindCandidates(); }}
            className="max-w-xl mx-auto"
          >
            {/* Input and button are flex siblings, so long queries scroll
                inside the input and never slide under the CTA. The border,
                shadow, and focus ring live on the container. */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-3xl sm:rounded-full border border-beige-300 bg-white/90 shadow-lg shadow-navy-900/5 p-2 sm:py-2 sm:pl-5 sm:pr-2 transition-all focus-within:border-gold-400 focus-within:ring-4 focus-within:ring-gold-500/15">
              <div className="flex items-center gap-2.5 flex-1 min-w-0 px-3 sm:px-0">
                <Search className="w-5 h-5 text-navy-400 shrink-0 pointer-events-none" />
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder={e.rolePlaceholder}
                  aria-label={e.rolePlaceholder}
                  className="flex-1 min-w-0 bg-transparent py-2.5 text-sm sm:text-base text-navy-900 placeholder:text-navy-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="shrink-0 w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-3 rounded-full bg-navy-900 text-white text-sm font-semibold hover:bg-gold-500 hover:text-navy-900 transition-all"
              >
                {e.findCandidates}
              </button>
            </div>
          </form>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
            <button
              type="button"
              onClick={onPostRole}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-500 text-navy-900 text-sm font-bold hover:bg-gold-400 transition-all shadow-lg shadow-gold-500/20"
            >
              {e.postRole}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onViewPreview}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-navy-300 bg-white/70 text-navy-900 text-sm font-semibold hover:border-navy-900 hover:bg-white transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              {e.viewPreview}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
