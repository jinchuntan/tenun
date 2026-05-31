"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  ArrowRight,
  Target,
  Lightbulb,
  TrendingUp,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { JobSuggestion } from "@/lib/types";

const PARTNER_MAP: Record<string, string[]> = {
  tech: ["Lazada", "Petronas", "Maybank", "American Express"],
  finance: ["Maybank", "American Express", "EY", "Petronas"],
  design: ["Lazada", "Unilever", "American Express"],
  engineering: ["Petronas", "Shell", "Top Glove", "Unilever"],
  marketing: ["Unilever", "Lazada", "Maybank"],
  data: ["Maybank", "Petronas", "EY", "Lazada"],
  consulting: ["EY", "Shell", "Petronas", "Maybank"],
  operations: ["Top Glove", "Unilever", "Shell", "Petronas"],
};

const ALL_PARTNERS = ["Unilever", "Maybank", "Top Glove", "Lazada", "Petronas", "Shell", "EY", "American Express"];

function getRelevantPartners(title: string, industries: string[]): string[] {
  const combined = `${title} ${industries.join(" ")}`.toLowerCase();
  if (/data|analyt|science|ml|ai|machine/.test(combined)) return PARTNER_MAP.data;
  if (/finance|bank|account|audit|tax|invest/.test(combined)) return PARTNER_MAP.finance;
  if (/design|ux|ui|visual|creative|brand/.test(combined)) return PARTNER_MAP.design;
  if (/engineer|develop|software|code|program/.test(combined)) return PARTNER_MAP.tech;
  if (/market|content|social|media/.test(combined)) return PARTNER_MAP.marketing;
  if (/consult|strateg|advisory/.test(combined)) return PARTNER_MAP.consulting;
  if (/manufactur|supply|operat|logistic/.test(combined)) return PARTNER_MAP.operations;
  return ALL_PARTNERS.slice(0, 4);
}

interface JobDetail {
  skills_required: string[];
  skills_nice_to_have: string[];
  secret_sauce: string;
  fit_questions: string[];
  common_gaps: string[];
  how_to_get_there: string;
  entry_paths: string[];
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.slug === "string" ? params.slug : "";

  const [job, setJob] = useState<JobSuggestion | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [detail, setDetail] = useState<JobDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Load job from sessionStorage — wait for slug to be available
  useEffect(() => {
    if (!slug) return;
    const stored = sessionStorage.getItem(`tenun-job-${slug}`);
    if (!stored) {
      setNotFound(true);
      return;
    }
    try {
      setJob(JSON.parse(stored));
    } catch {
      setNotFound(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Check Supabase auth — fully optional, page works without it
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserEmail(data.user.email ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch detailed AI breakdown once the job is loaded
  useEffect(() => {
    if (!job) return;
    setDetailLoading(true);
    setDetailError(null);
    fetch("/api/job-detail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: job.title,
        context: `${job.explanation} ${job.dayToDay ?? ""}`.trim(),
      }),
    })
      .then((r) => r.json())
      .then((d) => setDetail(d))
      .catch(() => setDetailError("Couldn't load the full breakdown. Try refreshing."))
      .finally(() => setDetailLoading(false));
  }, [job]);

  const handleSignIn = async () => {
    const supabase = createClient();
    if (!supabase) return;
    setSigningIn(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/jobs/${slug}` },
    });
  };

  const handleContinue = () => {
    if (job) sessionStorage.setItem("tenun-target-job", job.title);
    router.push("/profile");
  };

  // Not found state — session expired or direct URL visit
  if (notFound) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="pt-32 pb-20 text-center px-4">
          <h1 className="text-xl font-bold text-navy-900 mb-3">Job not found</h1>
          <p className="text-sm text-navy-500 mb-6">
            This usually happens if you navigated directly to this page. Search for a job first.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-800 text-white rounded-xl text-sm font-medium hover:bg-navy-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to search
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Loading state while sessionStorage is being read
  if (!job) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-navy-400" />
      </div>
    );
  }

  const partners = getRelevantPartners(job.title, job.industries ?? []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Back */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-navy-500 hover:text-navy-800 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to results
          </button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {job.salaryRange && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium">
                  {job.salaryRange}
                </span>
              )}
              {job.industries?.slice(0, 2).map((ind) => (
                <Badge key={ind} variant="secondary" className="text-xs">{ind}</Badge>
              ))}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-3">{job.title}</h1>
            <p className="text-navy-600 leading-relaxed text-base">{job.explanation}</p>
            {job.dayToDay && (
              <p className="mt-2 text-sm text-navy-400 italic">{job.dayToDay}</p>
            )}
          </motion.div>

          {/* AI breakdown */}
          <AnimatePresence>
            {detailLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4 mb-8"
              >
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-navy-50 rounded-xl animate-pulse" />
                ))}
              </motion.div>
            )}

            {detailError && (
              <motion.p
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-500 mb-8"
              >
                {detailError}
              </motion.p>
            )}

            {detail && !detailLoading && (
              <motion.div
                key="detail"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Skills */}
                <section className="rounded-xl border border-navy-100 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-4 h-4 text-navy-600" />
                    <h2 className="font-semibold text-navy-900">Skills you need</h2>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-navy-500 mb-2 font-medium uppercase tracking-wide">Must-have</p>
                    <div className="flex flex-wrap gap-2">
                      {detail.skills_required.map((s) => (
                        <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-navy-900 text-white font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  {detail.skills_nice_to_have.length > 0 && (
                    <div>
                      <p className="text-xs text-navy-500 mb-2 font-medium uppercase tracking-wide">Nice to have</p>
                      <div className="flex flex-wrap gap-2">
                        {detail.skills_nice_to_have.map((s) => (
                          <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-navy-50 text-navy-600 border border-navy-200">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                {/* Secret sauce */}
                {detail.secret_sauce && (
                  <section className="rounded-xl bg-amber-50 border border-amber-200 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <h2 className="font-semibold text-navy-900">The secret sauce</h2>
                    </div>
                    <p className="text-sm text-navy-700 leading-relaxed">{detail.secret_sauce}</p>
                  </section>
                )}

                {/* Fit check */}
                {detail.fit_questions.length > 0 && (
                  <section className="rounded-xl border border-navy-100 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <HelpCircle className="w-4 h-4 text-navy-600" />
                      <h2 className="font-semibold text-navy-900">Are you a good fit? Ask yourself:</h2>
                    </div>
                    <ul className="space-y-2.5">
                      {detail.fit_questions.map((q, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-navy-700">
                          <CheckCircle2 className="w-4 h-4 text-navy-400 mt-0.5 flex-shrink-0" />
                          {q}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Common gaps */}
                {detail.common_gaps.length > 0 && (
                  <section className="rounded-xl border border-navy-100 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <h2 className="font-semibold text-navy-900">What most candidates are missing</h2>
                    </div>
                    <ul className="space-y-2">
                      {detail.common_gaps.map((g, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-navy-700">
                          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {g}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* How to get there */}
                {detail.how_to_get_there && (
                  <section className="rounded-xl border border-navy-100 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-navy-600" />
                      <h2 className="font-semibold text-navy-900">How to get here as a student or fresh grad</h2>
                    </div>
                    <p className="text-sm text-navy-700 leading-relaxed">{detail.how_to_get_there}</p>
                    {detail.entry_paths.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="text-xs text-navy-400 self-center">Start with:</span>
                        {detail.entry_paths.map((p) => (
                          <span key={p} className="text-xs px-2.5 py-1 rounded-full bg-navy-50 text-navy-600 border border-navy-200">
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                {/* Companies hiring */}
                <section className="rounded-xl border border-navy-100 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="w-4 h-4 text-navy-600" />
                    <h2 className="font-semibold text-navy-900">Companies hiring for this role</h2>
                  </div>
                  <p className="text-xs text-navy-500 mb-3">
                    These TalentBank partners are actively looking for qualified candidates.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {partners.map((company) => (
                      <span
                        key={company}
                        className="text-xs px-3 py-1.5 rounded-full border border-navy-200 text-navy-700 font-medium bg-white hover:border-navy-400 hover:bg-navy-50 transition-all"
                      >
                        {company}
                      </span>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-10 rounded-2xl bg-gradient-to-br from-navy-800 to-navy-950 p-7 text-center"
          >
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
              <Lightbulb className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-white font-bold text-lg mb-2">
              See exactly how <em>you</em> fit this role
            </h2>
            <p className="text-navy-300 text-sm mb-5 max-w-md mx-auto leading-relaxed">
              Sign in to upload your CV and find out your skill gap, match score, and how
              to get in front of companies hiring for{" "}
              <strong className="text-white">{job.title}</strong>. Free for Weavers — one tap, no forms.
            </p>

            <button
              onClick={handleContinue}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-navy-900 rounded-xl text-sm font-semibold hover:bg-navy-50 transition-all"
            >
              Build my CV for this role
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
