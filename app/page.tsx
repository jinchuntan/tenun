"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CompanyTickerSlim } from "@/components/landing/CompanyTickerSlim";
import { HeroSection } from "@/components/landing/HeroSection";
import { ThreeStepsSection } from "@/components/landing/ThreeStepsSection";
import { PartnersSection } from "@/components/landing/PartnersSection";
import { WeaverFeaturesSection } from "@/components/landing/WeaverFeaturesSection";
import { CVSupportSection } from "@/components/landing/CVSupportSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { JobIntentResult, JobSuggestion } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { useLanguage } from "@/components/i18n/LanguageProvider";

// Single word with no spaces = likely generic query (e.g. "programmer", "designer")
const isGenericQuery = (q: string) => q.trim().length > 0 && !q.trim().includes(" ");

export default function HomePage() {
  const router = useRouter();
  const resultsRef = useRef<HTMLDivElement>(null);
  const { dict, locale } = useLanguage();
  const h = dict.home;
  const EXAMPLE_QUERIES = h.exampleQueries;

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JobIntentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (q?: string) => {
    const searchQuery = (q ?? query).trim();
    if (!searchQuery) return;

    setQuery(searchQuery);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/job-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, locale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || h.errorFailed);
      setResult(data as JobIntentResult);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : h.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  const selectJob = (job: JobSuggestion) => {
    const slug = slugify(job.title);
    sessionStorage.setItem(`tenun-job-${slug}`, JSON.stringify(job));
    router.push(`/jobs/${slug}`);
  };

  return (
    <div className="min-h-screen bg-ivory overflow-x-clip">
      <Navbar />

      {/* Slim hiring ticker directly below the fixed navbar */}
      <div className="pt-16">
        <CompanyTickerSlim />
      </div>

      <main>
        {/* ── HERO ── */}
        <HeroSection
          query={query}
          setQuery={setQuery}
          loading={loading}
          hasResult={!!result}
          onSearch={handleSearch}
          examples={EXAMPLE_QUERIES}
        />

        {/* ── RESULTS (directly under search) ── */}
        <div ref={resultsRef}>
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-3xl mx-auto px-4 sm:px-6 mb-8"
              >
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
                  <p className="text-sm font-semibold text-red-700 mb-1">{h.errorTitle}</p>
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              </motion.div>
            )}

            {loading && (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 space-y-4"
              >
                <div className="h-28 bg-beige-200 rounded-2xl animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-36 bg-beige-200 rounded-2xl animate-pulse" />
                  ))}
                </div>
              </motion.div>
            )}

            {result && !loading && (
              <motion.section
                key="results"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="max-w-3xl mx-auto px-4 sm:px-6 pb-20 pt-4"
                aria-label="Career search results"
              >
                {/* Empty state */}
                {result.suggestions.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                  >
                    <p className="text-navy-900 font-semibold mb-2">{h.emptyTitle}</p>
                    <p className="text-sm text-navy-500 mb-6 max-w-sm mx-auto">
                      {h.emptyBody}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {EXAMPLE_QUERIES.map((q) => (
                        <button
                          key={q}
                          onClick={() => handleSearch(q)}
                          className="text-xs px-3 py-1.5 rounded-full border border-beige-300 text-navy-600 hover:border-gold-400 hover:bg-white transition-all"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {result.suggestions.length > 0 && (
                  <>
                    {/* For generic single-word queries, surface didYouMean prominently above results */}
                    {isGenericQuery(query) && result.didYouMean?.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-5 p-4 rounded-2xl bg-gold-50 border border-gold-200"
                      >
                        <p className="text-xs font-semibold text-gold-700 mb-2">
                          &ldquo;{query}&rdquo; {h.broadPrefix}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {result.didYouMean.map((term) => (
                            <button
                              key={term}
                              onClick={() => handleSearch(term)}
                              className="text-xs px-3 py-1.5 rounded-full bg-white border border-gold-300 text-navy-700 hover:border-navy-400 transition-all"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {result.overview && (
                      <motion.article
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 bg-beige-100 border border-beige-300/60 rounded-2xl p-5"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-gold-500" />
                          <h2 className="text-xs font-semibold text-navy-500 uppercase tracking-wide">
                            {h.overviewLabel}
                          </h2>
                        </div>
                        <p className="text-sm text-navy-700 leading-relaxed">{result.overview}</p>
                        {/* Only show didYouMean inside overview box for descriptive queries */}
                        {!isGenericQuery(query) && result.didYouMean?.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="text-xs text-navy-400 self-center">{h.alsoExplore}</span>
                            {result.didYouMean.map((term) => (
                              <button
                                key={term}
                                onClick={() => handleSearch(term)}
                                className="text-xs px-2.5 py-1 rounded-full bg-white border border-beige-300 text-navy-600 hover:border-gold-400 transition-all"
                              >
                                {term}
                              </button>
                            ))}
                          </div>
                        )}
                      </motion.article>
                    )}

                    <h2 className="text-sm font-medium text-navy-500 mb-3">
                      {h.resultsHeadingPrefix} &ldquo;{query}&rdquo;{h.resultsHeadingSuffix}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                      {result.suggestions.map((s: JobSuggestion, i) => (
                        <motion.article
                          key={s.title}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="bg-white border border-beige-300/60 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-gold-400 hover:-translate-y-0.5 transition-all cursor-pointer group"
                          onClick={() => selectJob(s)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === "Enter" && selectJob(s)}
                          aria-label={`Explore ${s.title}`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold text-navy-900 text-sm leading-snug group-hover:text-navy-700 transition-colors">
                              {s.title}
                            </h3>
                            <ChevronRight className="w-4 h-4 text-navy-300 group-hover:text-gold-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
                          </div>
                          <p className="text-xs text-navy-500 leading-relaxed mb-2">{s.explanation}</p>
                          {s.dayToDay && (
                            <p className="text-xs text-navy-400 italic mb-3 leading-relaxed">{s.dayToDay}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-1.5 mt-auto">
                            {s.salaryRange && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium">
                                {s.salaryRange}
                              </span>
                            )}
                            {s.industries?.slice(0, 2).map((ind) => (
                              <Badge key={ind} variant="secondary" className="text-xs">{ind}</Badge>
                            ))}
                          </div>
                        </motion.article>
                      ))}
                    </div>
                  </>
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* ── SECTIONS ── */}
        <ThreeStepsSection />
        <PartnersSection />
        <WeaverFeaturesSection />
        <CVSupportSection />
        <FAQSection />
      </main>

      <Footer />
    </div>
  );
}
