"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Loader2,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Upload,
  BookOpen,
  Target,
  Map,
  Briefcase,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ThreadVisual } from "@/components/thread-visual";
import { JobIntentResult, JobSuggestion } from "@/lib/types";

const EXAMPLE_QUERIES = [
  "I want to build mobile apps",
  "I'm interested in data and numbers",
  "I want to do 3D animations",
  "I want to work in finance",
  "I like designing user interfaces",
  "I'm into AI and machine learning",
];

export default function HomePage() {
  const router = useRouter();
  const resultsRef = useRef<HTMLDivElement>(null);

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
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get suggestions.");
      setResult(data as JobIntentResult);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const selectJob = (title: string) => {
    sessionStorage.setItem("tenun-target-job", title);
    router.push("/profile");
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── HERO + SEARCH ── */}
      <main>
        <section
          className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden"
          aria-labelledby="hero-heading"
        >
          <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none" />

          {/* Thread visual — desktop right */}
          <div className="absolute top-0 right-0 w-[560px] h-[560px] opacity-[0.18] pointer-events-none hidden lg:block">
            <ThreadVisual variant="hero" className="w-full h-full" />
          </div>
          {/* Thread visual — desktop left mirror */}
          <div className="absolute top-10 left-0 w-[360px] h-[360px] opacity-[0.10] pointer-events-none hidden lg:block scale-x-[-1]">
            <ThreadVisual variant="hero" className="w-full h-full" />
          </div>

          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-navy-50 border border-navy-200 rounded-full px-4 py-1.5 mb-6"
            >
              <Sparkles className="w-4 h-4 text-gold-500" />
              <span className="text-sm text-navy-700 font-medium">
                Career discovery for students &amp; fresh graduates
              </span>
            </motion.div>

            <motion.h1
              id="hero-heading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-navy-900 mb-4"
            >
              What kind of work do{" "}
              <span className="gradient-text">you want to do?</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-navy-500 mb-8 max-w-xl mx-auto leading-relaxed"
            >
              Describe it in your own words. We&apos;ll translate it into real job
              titles, explain what each one looks like, and help you find the
              right path.
            </motion.p>

            {/* Search bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <form
                onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
                className="relative max-w-2xl mx-auto"
              >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400 pointer-events-none" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. I want to do 3D animations, or I want to work with data..."
                  className="w-full pl-12 pr-36 py-4 rounded-xl border-2 border-navy-200 bg-white text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-600 transition-all shadow-md"
                  aria-label="Describe the kind of work you want to do"
                />
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-navy-800 text-white text-sm font-medium hover:bg-navy-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Thinking...</>
                    : <><Sparkles className="w-4 h-4" /> Explore</>
                  }
                </button>
              </form>

              {/* Example pills */}
              <div className="flex flex-wrap justify-center gap-2 mt-4" role="list" aria-label="Example searches">
                {EXAMPLE_QUERIES.map((q) => (
                  <button
                    key={q}
                    role="listitem"
                    onClick={() => handleSearch(q)}
                    className="text-xs px-3 py-1.5 rounded-full border border-navy-200 text-navy-600 hover:border-navy-400 hover:bg-navy-50 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Mobile thread strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ duration: 1.2, delay: 0.8 }}
              className="lg:hidden mt-8 -mx-4"
            >
              <ThreadVisual variant="small" className="w-full h-16" />
            </motion.div>
          </div>
        </section>

        {/* ── RESULTS ── */}
        <div ref={resultsRef}>
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-3xl mx-auto px-4 sm:px-6 mb-8"
              >
                <p className="text-sm text-red-500 text-center">{error}</p>
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
                <div className="h-28 bg-navy-50 rounded-xl animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-36 bg-navy-50 rounded-xl animate-pulse" />
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
                className="max-w-3xl mx-auto px-4 sm:px-6 pb-20"
                aria-label="Career search results"
              >
                {/* AI Overview box */}
                {result.overview && (
                  <motion.article
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 bg-gradient-to-br from-navy-50 to-beige-50 border border-navy-100 rounded-xl p-5"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-gold-500" />
                      <h2 className="text-xs font-semibold text-navy-500 uppercase tracking-wide">
                        Career space overview
                      </h2>
                    </div>
                    <p className="text-sm text-navy-700 leading-relaxed">{result.overview}</p>

                    {result.didYouMean?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="text-xs text-navy-400 self-center">Explore:</span>
                        {result.didYouMean.map((term) => (
                          <button
                            key={term}
                            onClick={() => handleSearch(term)}
                            className="text-xs px-2.5 py-1 rounded-full bg-white border border-navy-200 text-navy-600 hover:border-navy-500 hover:bg-navy-50 transition-all"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.article>
                )}

                {/* Job cards */}
                <h2 className="text-sm font-medium text-navy-500 mb-3">
                  {result.suggestions.length} roles that match &ldquo;{query}&rdquo;
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {result.suggestions.map((s: JobSuggestion, i) => (
                    <motion.article
                      key={s.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="bg-white border border-navy-100 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-navy-300 transition-all cursor-pointer group"
                      onClick={() => selectJob(s.title)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && selectJob(s.title)}
                      aria-label={`Explore ${s.title}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-navy-900 text-sm leading-snug group-hover:text-navy-700 transition-colors">
                          {s.title}
                        </h3>
                        <ChevronRight className="w-4 h-4 text-navy-300 group-hover:text-navy-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
                      </div>

                      <p className="text-xs text-navy-500 leading-relaxed mb-2">{s.explanation}</p>

                      {s.dayToDay && (
                        <p className="text-xs text-navy-400 italic mb-3 leading-relaxed">
                          {s.dayToDay}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-1.5 mt-auto">
                        {s.salaryRange && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium">
                            {s.salaryRange}
                          </span>
                        )}
                        {s.industries?.slice(0, 2).map((ind) => (
                          <Badge key={ind} variant="secondary" className="text-xs">
                            {ind}
                          </Badge>
                        ))}
                      </div>
                    </motion.article>
                  ))}
                </div>

                {/* Resume CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-r from-navy-800 to-navy-900 rounded-2xl p-6 text-center"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-base mb-1">
                    Want to see how <em>you</em> fit these roles?
                  </h3>
                  <p className="text-navy-300 text-sm mb-4 max-w-sm mx-auto">
                    Upload your resume and we&apos;ll show you your skill gaps, match scores,
                    and a personalised pathway for each role.
                  </p>
                  <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-navy-900 rounded-lg text-sm font-medium hover:bg-navy-50 transition-all"
                  >
                    Upload my resume
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* ── HOW IT WORKS (below fold — AEO content) ── */}
        <section
          id="how-it-works"
          className="py-16 md:py-20 bg-beige-50 border-t border-navy-100"
          aria-labelledby="how-heading"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 id="how-heading" className="text-2xl sm:text-3xl font-bold text-navy-900 text-center mb-10">
              How Tenun works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Search,
                  step: "1",
                  title: "Describe what you want",
                  body: "Type in plain language — 'I want to work with data' or 'I like creative design'. Tenun maps your words to real job titles you may not have known existed.",
                },
                {
                  icon: BookOpen,
                  step: "2",
                  title: "Discover the right roles",
                  body: "See 6–8 distinct job titles that match what you described, with salary ranges, day-to-day breakdowns, and the industries that hire for them.",
                },
                {
                  icon: Target,
                  step: "3",
                  title: "Get your personalised plan",
                  body: "Upload your resume. Tenun analyses your skills against each role, surfaces your skill gaps, and builds a realistic career pathway with actionable next steps.",
                },
              ].map((item) => (
                <article key={item.step} className="flex flex-col items-start">
                  <div className="w-10 h-10 rounded-xl bg-navy-800 flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-navy-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-navy-500 leading-relaxed">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHY TENUN ── */}
        <section className="relative py-16 md:py-20 overflow-hidden" aria-labelledby="why-heading">
          <div className="absolute inset-0 pointer-events-none opacity-[0.07]">
            <ThreadVisual variant="background" className="w-full h-full" />
          </div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 id="why-heading" className="text-2xl sm:text-3xl font-bold text-navy-900 mb-4">
              Built for students who don&apos;t know their job title yet
            </h2>
            <p className="text-navy-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Most job search tools expect you to already know what you&apos;re looking for.
              Tenun starts from where you actually are — a vague idea of what you enjoy —
              and works forward from there.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              {[
                {
                  icon: Map,
                  title: "Multiple pathways, not one answer",
                  body: "Real careers branch. Tenun shows you five distinct paths for your chosen role, with honest trade-offs and timelines.",
                },
                {
                  icon: Briefcase,
                  title: "Skill gaps, not vague advice",
                  body: "You get a precise list of what skills you need and which courses or projects will close each gap fastest.",
                },
                {
                  icon: Sparkles,
                  title: "AI overview, not noise",
                  body: "Every search gives you a synthesised overview of the career space — the kind of answer you'd get from a well-connected mentor.",
                },
              ].map((item) => (
                <article key={item.title} className="p-5 rounded-xl border border-navy-100">
                  <item.icon className="w-5 h-5 text-gold-500 mb-3" />
                  <h3 className="font-semibold text-navy-900 mb-1 text-sm">{item.title}</h3>
                  <p className="text-xs text-navy-500 leading-relaxed">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
