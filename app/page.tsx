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
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ThreadVisual } from "@/components/thread-visual";
import { CompanyTicker, CompanyTickerSlim } from "@/components/company-ticker";
import { CvTransformation } from "@/components/cv-transformation";
import { JobIntentResult, JobSuggestion } from "@/lib/types";
import { slugify } from "@/lib/utils";

const EXAMPLE_QUERIES = [
  "I want to build mobile apps",
  "I like working with data and numbers",
  "I want to do 3D animations",
  "I like designing user interfaces",
  "I want to help people with money",
  "I'm into AI and machine learning",
];

const FAQ_ITEMS = [
  {
    q: "What is Tenun?",
    a: "Tenun is a career discovery platform that helps students and fresh graduates find the right job title — even when they don't know what they're looking for. You describe what you enjoy doing, and Tenun maps it to real job titles with salary ranges, required skills, and a step-by-step path to get there. Tenun is powered by TalentBank, Malaysia's leading talent placement platform.",
  },
  {
    q: "Do I need to know my job title to use Tenun?",
    a: "No — that's the whole point. Most job boards assume you already know what to search for. Tenun starts from what you enjoy doing ('I like working with data' or 'I want to design things') and works backwards to find the right career path for you.",
  },
  {
    q: "How does Tenun find the right job for me?",
    a: "You type what you enjoy in plain language. Tenun uses AI to map your description to 6 real job titles, then explains what each one actually involves — day-to-day tasks, salary ranges, required skills, and the 'secret sauce' that separates good candidates from great ones.",
  },
  {
    q: "What companies are hiring through Tenun?",
    a: "Tenun partners with Unilever, Maybank, Petronas, Shell, Lazada, EY, American Express, and Top Glove in Malaysia. These companies post jobs directly through TalentBank's network rather than blindly on LinkedIn, so every candidate they see has been career-matched and vetted.",
  },
  {
    q: "Is Tenun free to use?",
    a: "Yes. Discovering jobs, exploring career paths, and reading full role breakdowns are all free. Creating an account (with Google) lets you save your results, upload your CV, and get matched to live job openings at our partner companies.",
  },
  {
    q: "How is Tenun different from LinkedIn or JobStreet?",
    a: "LinkedIn and JobStreet require you to know your job title. Tenun doesn't. We also give you the full roadmap — what skills you need, what the secret advantage is for each role, and which real companies are hiring. Think of it less like a job board and more like a career GPS.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-navy-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-4 group"
        aria-expanded={open}
      >
        <span className="font-medium text-navy-900 text-sm sm:text-base">{q}</span>
        <ChevronDown
          className={`w-4 h-4 text-navy-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-navy-600 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const resultsRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JobIntentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Single word with no spaces = likely generic query (e.g. "programmer", "designer")
  const isGenericQuery = (q: string) => q.trim().length > 0 && !q.trim().includes(" ");

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

  const selectJob = (job: JobSuggestion) => {
    const slug = slugify(job.title);
    sessionStorage.setItem(`tenun-job-${slug}`, JSON.stringify(job));
    router.push(`/jobs/${slug}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Slim hiring strip — sits directly under the navbar */}
      <div className="pt-16">
        <CompanyTickerSlim />
      </div>

      <main>
        {/* ── HERO ── */}
        <section
          className="relative pt-6 pb-16 md:pt-8 md:pb-24 overflow-hidden"
          aria-labelledby="hero-heading"
        >
          <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none" />
          <div className="absolute top-0 right-0 w-[560px] h-[560px] opacity-[0.15] pointer-events-none hidden lg:block">
            <ThreadVisual variant="hero" className="w-full h-full" />
          </div>
          <div className="absolute top-10 left-0 w-[360px] h-[360px] opacity-[0.08] pointer-events-none hidden lg:block scale-x-[-1]">
            <ThreadVisual variant="hero" className="w-full h-full" />
          </div>

          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
            {/* TalentBank badge */}
            <motion.h1
              id="hero-heading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-navy-900 mb-3 leading-tight"
            >
              Don&apos;t know the job title
              <br className="hidden sm:block" />
              you&apos;re looking for?{" "}
              <span className="gradient-text">We got you, Weaver.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-navy-500 mb-4 max-w-xl mx-auto leading-relaxed"
            >
              Whether you&apos;re just starting out or ready for your next move,
              tell us what you enjoy and we&apos;ll find the right career path and
              connect you to real jobs at top Malaysian companies.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex items-center justify-center gap-4 mb-8 text-xs text-navy-400"
            >
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Free for Weavers
              </span>
              <span className="w-px h-3 bg-navy-200" />
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                No credit card required
              </span>
              <span className="w-px h-3 bg-navy-200" />
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Jobs from top employers
              </span>
            </motion.div>

            {/* Search */}
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
                  placeholder="e.g. I want to work with data, or I like designing things..."
                  className="w-full pl-12 pr-36 py-4 rounded-xl border-2 border-navy-200 bg-white text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-600 transition-all shadow-md"
                  aria-label="Describe the kind of work you want to do"
                />
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-navy-800 text-white text-sm font-medium hover:bg-navy-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Weaving...</>
                    : <>Explore</>}
                </button>
              </form>

              {/* Single-word hint */}
              <AnimatePresence>
                {isGenericQuery(query) && !loading && !result && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-navy-400 mt-2 text-center"
                  >
                    Tip: describing what you enjoy gets better results, e.g.{" "}
                    <button
                      onClick={() => handleSearch(`I want to ${query} games`)}
                      className="text-navy-600 underline underline-offset-2 hover:text-navy-900"
                    >
                      &ldquo;I want to {query} games&rdquo;
                    </button>
                  </motion.p>
                )}
              </AnimatePresence>

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
          </div>
        </section>

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
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
                  <p className="text-sm font-semibold text-red-700 mb-1">Something went wrong</p>
                  <p className="text-xs text-red-600">{error}</p>
                  {error.toLowerCase().includes("api key") && (
                    <p className="text-xs text-red-500 mt-2">
                      Make sure <code className="bg-red-100 px-1 rounded">GROQ_API_KEY</code> is set in your{" "}
                      <code className="bg-red-100 px-1 rounded">.env.local</code> file, then restart the dev server.
                    </p>
                  )}
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
                <div className="h-28 bg-navy-50 rounded-xl animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => (
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
                {/* Empty state */}
                {result.suggestions.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                  >
                    <p className="text-navy-900 font-semibold mb-2">We couldn&apos;t pin down specific roles for that.</p>
                    <p className="text-sm text-navy-500 mb-6 max-w-sm mx-auto">
                      Try describing what you actually enjoy doing. The more specific, the better the match.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {EXAMPLE_QUERIES.map((q) => (
                        <button
                          key={q}
                          onClick={() => handleSearch(q)}
                          className="text-xs px-3 py-1.5 rounded-full border border-navy-200 text-navy-600 hover:border-navy-400 hover:bg-navy-50 transition-all"
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
                    className="mb-5 p-4 rounded-xl bg-gold-50 border border-gold-200"
                  >
                    <p className="text-xs font-semibold text-gold-700 mb-2">
                      &ldquo;{query}&rdquo; is broad. Want more specific results? Try:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.didYouMean.map((term) => (
                        <button
                          key={term}
                          onClick={() => handleSearch(term)}
                          className="text-xs px-3 py-1.5 rounded-full bg-white border border-gold-300 text-navy-700 hover:border-navy-400 hover:bg-navy-50 transition-all"
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
                    className="mb-6 bg-gradient-to-br from-navy-50 to-beige-50 border border-navy-100 rounded-xl p-5"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-gold-500" />
                      <h2 className="text-xs font-semibold text-navy-500 uppercase tracking-wide">
                        Career space overview
                      </h2>
                    </div>
                    <p className="text-sm text-navy-700 leading-relaxed">{result.overview}</p>
                    {/* Only show didYouMean inside overview box for descriptive queries */}
                    {!isGenericQuery(query) && result.didYouMean?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="text-xs text-navy-400 self-center">Also explore:</span>
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

                <h2 className="text-sm font-medium text-navy-500 mb-3">
                  6 roles that match &ldquo;{query}&rdquo;. Click any to see what it takes.
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {result.suggestions.map((s: JobSuggestion, i) => (
                    <motion.article
                      key={s.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="bg-white border border-navy-100 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-navy-300 transition-all cursor-pointer group"
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
                        <ChevronRight className="w-4 h-4 text-navy-300 group-hover:text-navy-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
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

        {/* ── HOW IT WORKS ── */}
        <section
          id="how-it-works"
          className="py-10 md:py-14 bg-navy-50 border-t border-b border-navy-100"
          aria-labelledby="how-heading"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8">
              <p className="text-xs font-semibold text-gold-600 uppercase tracking-widest mb-2">
                Simple. Fast. No fluff.
              </p>
              <h2 id="how-heading" className="text-2xl sm:text-3xl font-bold text-navy-900">
                From curious to career-ready in 3 steps
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connector line on desktop */}
              <div className="hidden md:block absolute top-8 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-navy-200" />

              {[
                {
                  step: "01",
                  title: "Search in plain language",
                  body: "No job title needed. Type what you enjoy — 'I like working with numbers' or 'I want to make things look good.' Tenun maps it to 6 real careers.",
                },
                {
                  step: "02",
                  title: "See what it actually takes",
                  body: "Click any role to see the required skills, salary range, the secret sauce that sets top candidates apart, and an honest fit check.",
                },
                {
                  step: "03",
                  title: "Get your personalised path",
                  body: "Sign in and upload your CV. We show exactly how you fit, what to improve, and match you to open roles at top Malaysian companies.",
                },
              ].map((item, i) => (
                <motion.article
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="flex flex-col items-start relative"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white border-2 border-navy-200 flex items-center justify-center mb-4 shadow-sm z-10">
                    <span className="text-lg font-black text-navy-800">{item.step}</span>
                  </div>
                  <h3 className="font-bold text-navy-900 mb-2 text-base">{item.title}</h3>
                  <p className="text-sm text-navy-500 leading-relaxed">{item.body}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMPANY TICKER (partners) ── */}
        <CompanyTicker />

        {/* ── CV TRANSFORMATION ── */}
        <CvTransformation />

        {/* ── FOR WEAVERS (value props) ── */}
        <section
          id="features"
          className="py-10 md:py-14 bg-navy-50 border-t border-navy-100"
          aria-labelledby="features-heading"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8">
              <p className="text-xs font-semibold text-gold-600 uppercase tracking-widest mb-2">
                For Weavers
              </p>
              <h2 id="features-heading" className="text-2xl sm:text-3xl font-bold text-navy-900 mb-3">
                Built for people who don&apos;t know their job title yet
              </h2>
              <p className="text-sm text-navy-500 max-w-xl mx-auto">
                Most platforms expect you to already know what you want. Tenun starts from where you actually are.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Job discovery, not just job search",
                  body: "Type what you enjoy. Get 6 real job titles you may not have known existed, each with salary ranges, day-to-day breakdowns, and required skills.",
                },
                {
                  title: "The secret sauce, not just job descriptions",
                  body: "Learn what actually separates candidates who get hired from those who don't, for every role you explore. No generic advice.",
                },
                {
                  title: "A global career atlas",
                  body: "See where in the world you could work based on your degree, experience, and skills, from Kuala Lumpur to Sydney to London.",
                },
                {
                  title: "A personalised path, not a list of courses",
                  body: "Upload your CV and get a real gap analysis. Exactly what you're missing, which companies want you, and what to do first.",
                },
              ].map((item, i) => (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="p-6 rounded-xl bg-white border border-navy-100 hover:border-navy-300 hover:shadow-sm transition-all"
                >
                  <h3 className="font-bold text-navy-900 mb-2 text-sm">{item.title}</h3>
                  <p className="text-xs text-navy-500 leading-relaxed">{item.body}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOR COMPANIES ── */}
        <section
          id="companies"
          className="py-10 md:py-14 bg-navy-900 relative overflow-hidden"
          aria-labelledby="companies-heading"
        >
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
            <ThreadVisual variant="background" className="w-full h-full" />
          </div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-xs font-semibold text-gold-400 uppercase tracking-widest mb-3">
                  For Employers
                </p>
                <h2 id="companies-heading" className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
                  Stop interviewing the wrong people.
                </h2>
                <p className="text-navy-300 text-sm leading-relaxed mb-6">
                  Every candidate on Tenun has been career-matched, skill-checked, and
                  motivated to land exactly the kind of role you&apos;re hiring for.
                  Less time screening. Better hires.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Pre-assessed candidates matched to your specific role",
                    "Tinder-style candidate review — CV, LinkedIn, GitHub in one screen",
                    "AI-generated candidate summary and interview questions before you meet",
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-sm text-navy-200">
                      <CheckCircle2 className="w-4 h-4 text-gold-400 mt-0.5 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:partnerships@tenun.career"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold-500 text-navy-900 rounded-xl text-sm font-semibold hover:bg-gold-400 transition-all"
                >
                  Partner with Tenun
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "8+", sub: "Partner companies" },
                  { label: "Pre-vetted", sub: "Candidates only" },
                  { label: "3 clicks", sub: "To contact a candidate" },
                  { label: "Built with", sub: "TalentBank network" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-5 rounded-xl bg-white/5 border border-white/10 text-center"
                  >
                    <div className="text-xl font-black text-gold-400 mb-1">{stat.label}</div>
                    <div className="text-xs text-navy-400">{stat.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section
          id="faq"
          className="py-10 md:py-14"
          aria-labelledby="faq-heading"
        >
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8">
              <p className="text-xs font-semibold text-gold-600 uppercase tracking-widest mb-2">
                FAQ
              </p>
              <h2 id="faq-heading" className="text-2xl sm:text-3xl font-bold text-navy-900">
                Questions we get a lot
              </h2>
            </div>
            <div className="rounded-2xl border border-navy-100 bg-white px-6 divide-y divide-navy-100">
              {FAQ_ITEMS.map((item) => (
                <FAQItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="py-10 md:py-14 bg-navy-50 border-t border-navy-100">
          <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-3">
                Your career path starts with one search.
              </h2>
              <p className="text-navy-500 text-sm mb-6">
                No account needed. Just tell us what you enjoy.
              </p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="inline-flex items-center gap-2 px-6 py-3 bg-navy-800 text-white rounded-xl text-sm font-semibold hover:bg-navy-700 transition-all"
              >
                <Search className="w-4 h-4" />
                Start exploring careers
              </button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
