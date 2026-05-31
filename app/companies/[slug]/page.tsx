"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Lock,
  MapPin,
  Briefcase,
  Loader2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/client";
import { getCompany, type JobListing } from "@/lib/data/company-jobs";

export default function CompanyPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.slug === "string" ? params.slug : "";

  const company = getCompany(slug);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!company) { router.push("/"); return; }
    const supabase = createClient();
    if (!supabase) { setAuthChecked(true); return; }

    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
      setAuthChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, [company, router]);

  const handleSignIn = async () => {
    const supabase = createClient();
    if (!supabase) return;
    setSigningIn(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/companies/${slug}`,
      },
    });
  };

  const handleApply = (job: JobListing) => {
    if (!company) return;
    sessionStorage.setItem("tenun-apply-job", JSON.stringify({ job, company: company.name }));
    sessionStorage.setItem("tenun-target-job", job.title);
    router.push("/profile");
  };

  if (!company) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-navy-400" />
      </div>
    );
  }

  const isLoggedIn = !!userEmail;
  // Teaser: always show first 2 jobs, rest locked
  const visibleJobs = company.jobs.slice(0, 2);
  const lockedJobs = company.jobs.slice(2);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-24 pb-20">
        {/* Header */}
        <div className="bg-navy-50 border-b border-navy-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm text-navy-500 hover:text-navy-800 transition-colors mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back
            </button>

            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-white border border-navy-200 flex items-center justify-center flex-shrink-0 overflow-hidden p-2 shadow-sm">
                <Image
                  src={company.logo}
                  alt={`${company.name} logo`}
                  width={56}
                  height={56}
                  className="object-contain w-full h-full"
                  unoptimized
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-gold-600 uppercase tracking-widest">
                    {company.category}
                  </span>
                  <span className="text-xs text-navy-400">· TalentBank Partner</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-2">{company.name}</h1>
                <p className="text-navy-500 text-sm max-w-xl leading-relaxed">{company.tagline}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left: company info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="rounded-xl border border-navy-100 p-5">
                <h2 className="font-semibold text-navy-900 mb-3 text-sm">About {company.name}</h2>
                <p className="text-sm text-navy-600 leading-relaxed">{company.about}</p>
              </div>

              <div className="rounded-xl bg-amber-50 border border-amber-200 p-5">
                <h2 className="font-semibold text-navy-900 mb-2 text-sm">Why apply through Tenun?</h2>
                <p className="text-sm text-navy-700 leading-relaxed">{company.why}</p>
              </div>

              {!isLoggedIn && authChecked && (
                <div className="rounded-xl bg-navy-900 p-5 text-center">
                  <p className="text-white font-semibold text-sm mb-1">
                    Free for Weavers
                  </p>
                  <p className="text-navy-400 text-xs mb-4">
                    No credit card required. Sign in to unlock all {company.jobs.length} roles.
                  </p>
                  <button
                    onClick={handleSignIn}
                    disabled={signingIn}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-navy-900 rounded-lg text-sm font-semibold hover:bg-navy-50 disabled:opacity-60 transition-all"
                  >
                    {signingIn ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    )}
                    Sign in with Google
                  </button>
                </div>
              )}

              {isLoggedIn && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">You&apos;re in, Weaver</p>
                    <p className="text-xs text-emerald-600">{userEmail}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: job listings */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-navy-900">
                  Open roles at {company.name}
                </h2>
                <span className="text-xs text-navy-500 bg-navy-50 px-2.5 py-1 rounded-full border border-navy-200">
                  {company.jobs.length} roles
                </span>
              </div>

              {/* Visible jobs (always shown) */}
              {visibleJobs.map((job, i) => (
                <JobCard
                  key={job.id}
                  job={job}
                  index={i}
                  isLoggedIn={isLoggedIn}
                  onApply={() => handleApply(job)}
                />
              ))}

              {/* Locked jobs */}
              {lockedJobs.length > 0 && (
                <>
                  {isLoggedIn ? (
                    lockedJobs.map((job, i) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        index={i + 2}
                        isLoggedIn={true}
                        onApply={() => handleApply(job)}
                      />
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="rounded-xl border-2 border-dashed border-navy-200 p-8 text-center"
                    >
                      <Lock className="w-8 h-8 text-navy-300 mx-auto mb-3" />
                      <p className="font-semibold text-navy-900 mb-1">
                        {lockedJobs.length} more roles at {company.name}
                      </p>
                      <p className="text-sm text-navy-500 mb-5 max-w-xs mx-auto">
                        Sign in to see all roles and apply directly — free for Weavers, no credit card required.
                      </p>
                      <button
                        onClick={handleSignIn}
                        disabled={signingIn}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-800 text-white rounded-xl text-sm font-semibold hover:bg-navy-700 disabled:opacity-60 transition-all"
                      >
                        {signingIn ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>Unlock all roles — it&apos;s free <ArrowRight className="w-4 h-4" /></>
                        )}
                      </button>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function JobCard({
  job,
  index,
  isLoggedIn,
  onApply,
}: {
  job: JobListing;
  index: number;
  isLoggedIn: boolean;
  onApply: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="rounded-xl border border-navy-100 bg-white p-5 hover:border-navy-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              job.type === "Graduate Programme"
                ? "bg-blue-50 text-blue-700 border border-blue-100"
                : job.type === "Internship"
                ? "bg-purple-50 text-purple-700 border border-purple-100"
                : "bg-navy-50 text-navy-700 border border-navy-200"
            }`}>
              {job.type}
            </span>
          </div>
          <h3 className="font-semibold text-navy-900 text-base mb-1">{job.title}</h3>
          <div className="flex items-center gap-1.5 text-xs text-navy-400 mb-2">
            <MapPin className="w-3 h-3" />
            {job.location}
          </div>
          <p className="text-sm text-navy-600 leading-relaxed mb-3">{job.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {job.skills.map((s) => (
              <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-navy-50 text-navy-600 border border-navy-100">
                {s}
              </span>
            ))}
          </div>
        </div>

        {isLoggedIn && (
          <button
            onClick={onApply}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-navy-800 text-white rounded-lg text-sm font-medium hover:bg-navy-700 transition-all"
          >
            <Briefcase className="w-3.5 h-3.5" />
            Apply
          </button>
        )}
      </div>
    </motion.div>
  );
}
