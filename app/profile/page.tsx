"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  GraduationCap,
  Cpu,
  Sun,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Upload,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SubNavBar } from "@/components/layout/SubNavBar";
import { getDashboardReturn } from "@/lib/navigation";
import { CVUpload } from "@/components/cv-upload";
import { UserProfile } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { signInWithGoogle } from "@/lib/use-auth";
import { demoProfile } from "@/lib/demo-data";
import {
  skillSuggestions,
  interestSuggestions,
  industrySuggestions,
} from "@/lib/resume-parser";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const STEPS = [
  { label: "Basic Info", icon: User },
  { label: "Background", icon: GraduationCap },
  { label: "Skills", icon: Cpu },
  { label: "Preferences", icon: Sun },
] as const;

// ── Tag input (interests & industries) ──────────────────────────────────────
function TagInput({
  values,
  onChange,
  suggestions,
  placeholder,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  suggestions: string[];
  placeholder: string;
}) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !values.includes(trimmed)) onChange([...values, trimmed]);
    setInput("");
    setShowSuggestions(false);
  };

  const removeTag = (tag: string) => onChange(values.filter((v) => v !== tag));

  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !values.includes(s)
  );

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((v) => (
          <Badge key={v} variant="secondary" className="cursor-pointer group">
            {v}
            <button onClick={() => removeTag(v)} className="ml-1 opacity-60 group-hover:opacity-100">
              &times;
            </button>
          </Badge>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (input.trim()) addTag(input); } }}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-lg border border-navy-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all"
      />
      {showSuggestions && input && filtered.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-navy-100 rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {filtered.slice(0, 8).map((s) => (
            <button key={s} onClick={() => addTag(s)} className="w-full text-left px-4 py-2 text-sm hover:bg-navy-50 transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Skill chip grid ──────────────────────────────────────────────────────────
function SkillChipGrid({
  values,
  onChange,
  suggestions,
  placeholder,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  suggestions: string[];
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  const toggle = (skill: string) =>
    onChange(values.includes(skill) ? values.filter((v) => v !== skill) : [...values, skill]);

  const addCustom = () => {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) onChange([...values, trimmed]);
    setInput("");
  };

  const customSkills = values.filter((v) => !suggestions.includes(v));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {suggestions.map((skill) => {
          const selected = values.includes(skill);
          return (
            <button
              key={skill}
              type="button"
              onClick={() => toggle(skill)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${
                selected
                  ? "border-navy-700 bg-navy-700 text-white"
                  : "border-navy-200 bg-white text-navy-600 hover:border-navy-400"
              }`}
            >
              {selected && <Check className="w-3 h-3 inline mr-1" />}
              {skill}
            </button>
          );
        })}
        {customSkills.map((skill) => (
          <button
            key={skill}
            type="button"
            onClick={() => toggle(skill)}
            className="px-3 py-1.5 rounded-full text-sm font-medium border-2 border-gold-400 bg-gold-50 text-gold-700"
          >
            {skill} <span className="ml-1 opacity-60">×</span>
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
          placeholder={placeholder}
          className="flex-1 px-4 py-2.5 rounded-lg border border-navy-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all"
        />
        {input.trim() && (
          <button
            type="button"
            onClick={addCustom}
            className="px-4 py-2.5 rounded-lg bg-navy-700 text-white text-sm font-medium hover:bg-navy-800 transition-colors"
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
}

// ── Step indicator ────────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center mb-10">
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const Icon = step.icon;
        return (
          <React.Fragment key={step.label}>
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  done
                    ? "bg-navy-700 border-navy-700 text-white"
                    : active
                    ? "border-navy-700 bg-white text-navy-700"
                    : "border-navy-200 bg-white text-navy-300"
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span
                className={`text-xs mt-1.5 font-medium whitespace-nowrap ${
                  active ? "text-navy-700" : done ? "text-navy-500" : "text-navy-300"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-3 mb-4 transition-colors ${done ? "bg-navy-700" : "bg-navy-200"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function ProfilePageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { dict } = useLanguage();
  const uploadMode = searchParams.get("upload") === "true";
  const uploadSectionRef = useRef<HTMLDivElement | null>(null);
  const [highlightUpload, setHighlightUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [targetJob, setTargetJob] = React.useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [signingIn, setSigningIn] = React.useState(false);
  const [step, setStep] = useState(0);

  React.useEffect(() => {
    const job = sessionStorage.getItem("tenun-target-job");
    if (job) setTargetJob(job);
  }, []);

  useEffect(() => {
    if (!uploadMode) return;
    const scrollTimer = setTimeout(() => {
      uploadSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
    setHighlightUpload(true);
    const highlightTimer = setTimeout(() => setHighlightUpload(false), 3000);
    return () => { clearTimeout(scrollTimer); clearTimeout(highlightTimer); };
  }, [uploadMode]);

  React.useEffect(() => {
    const supabase = createClient();
    if (!supabase) { setIsLoggedIn(true); return; }
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
      const googleName =
        data.user?.user_metadata?.full_name ||
        data.user?.user_metadata?.name ||
        "";
      if (googleName) {
        setProfile((prev) => prev.name ? prev : { ...prev, name: googleName });
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignInForUpload() {
    setSigningIn(true);
    try { await signInWithGoogle("/profile"); } catch { setSigningIn(false); }
  }

  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    currentRole: "",
    education: "",
    experience: "",
    skills: [],
    interests: [],
    preferredIndustries: [],
    salaryExpectation: "",
    riskAppetite: "medium",
    lifestylePreference: "flexibility",
    locationPreference: "",
    resumeText: "",
  });

  useEffect(() => {
    const stored = sessionStorage.getItem("tenun-profile");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as Partial<UserProfile>;
      setProfile((prev) => ({ ...prev, ...parsed }));
    } catch { /* ignore malformed */ }
  }, []);

  const update = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) =>
    setProfile((prev) => ({ ...prev, [key]: value }));

  const loadDemo = () => setProfile(demoProfile);

  const applyParsedProfile = (parsed: Partial<UserProfile>) => {
    setProfile((prev) => {
      const merged = { ...prev };
      if (parsed.name && !prev.name) merged.name = parsed.name;
      if (parsed.currentRole && !prev.currentRole) merged.currentRole = parsed.currentRole;
      if (parsed.education && !prev.education) merged.education = parsed.education;
      if (parsed.experience && !prev.experience) merged.experience = parsed.experience;
      if (parsed.locationPreference && !prev.locationPreference) merged.locationPreference = parsed.locationPreference;
      if (parsed.skills) merged.skills = [...new Set([...prev.skills, ...parsed.skills])];
      if (parsed.interests) merged.interests = [...new Set([...prev.interests, ...parsed.interests])];
      if (parsed.preferredIndustries) merged.preferredIndustries = [...new Set([...prev.preferredIndustries, ...parsed.preferredIndustries])];
      if (parsed.resumeText) merged.resumeText = parsed.resumeText;
      return merged;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    sessionStorage.setItem("tenun-profile", JSON.stringify(profile));
    setTimeout(() => { router.push("/dashboard"); }, 1500);
  };

  const inputCls = "w-full px-4 py-2.5 rounded-lg border border-navy-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all";
  const labelCls = "block text-sm font-medium text-navy-800 mb-1.5";

  const firstName = profile.name.split(" ")[0];
  const canAdvanceStep1 = !!profile.name.trim() && !!profile.currentRole.trim();

  const riskOptions = [
    { value: "low" as const, label: dict.profile.riskLow, desc: "Stable roles, clear paths, no surprises" },
    { value: "medium" as const, label: dict.profile.riskMedium, desc: "I'll take a leap if the growth is real" },
    { value: "high" as const, label: dict.profile.riskHigh, desc: "Startups, pivots, building from zero — bring it on" },
  ];

  return (
    <div className="min-h-screen bg-beige-50">
      <Navbar />
      <div className="pt-24 pb-16 max-w-3xl mx-auto px-4 sm:px-6">
        <SubNavBar
          className="mb-8"
          breadcrumbs={[
            { label: dict.profile.breadcrumbDashboard, href: "/dashboard" },
            { label: dict.profile.breadcrumbProfile },
          ]}
          returnTo={getDashboardReturn(pathname, { loggedIn: isLoggedIn, labels: dict.navLabels })}
        />

        {targetJob && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6"
          >
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-emerald-700 font-medium">
                {dict.profile.exploring} <strong>{targetJob}</strong>
              </span>
            </div>
          </motion.div>
        )}

        <StepIndicator current={step} />

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="space-y-6"
            >
              {/* ── Step 1: Basic Info ─────────────────────────────────── */}
              {step === 0 && (
                <>
                  <div>
                    <h2 className="text-2xl font-bold text-navy-900 mb-1">
                      {profile.name
                        ? `Welcome${isLoggedIn ? " back" : ""}, ${firstName}!`
                        : "What should we call you?"}
                    </h2>
                    <p className="text-sm text-navy-500">
                      {isLoggedIn
                        ? "We've pre-filled what we can from your account."
                        : "Tell us a bit about yourself to get started."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>{dict.profile.fullName}</label>
                      <input
                        type="text"
                        required
                        value={profile.name}
                        onChange={(e) => update("name", e.target.value)}
                        placeholder={dict.profile.fullNamePlaceholder}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>{dict.profile.currentRole}</label>
                      <input
                        type="text"
                        required
                        value={profile.currentRole}
                        onChange={(e) => update("currentRole", e.target.value)}
                        placeholder={dict.profile.currentRolePlaceholder}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div
                    id="upload-cv-portfolio"
                    ref={uploadSectionRef}
                    className={[
                      "rounded-2xl transition-shadow duration-500 scroll-mt-24",
                      highlightUpload ? "ring-2 ring-gold-500 ring-offset-2 shadow-lg" : "",
                    ].join(" ")}
                  >
                    {isLoggedIn ? (
                      <CVUpload onProfileExtracted={applyParsedProfile} />
                    ) : (
                      <div className="rounded-2xl border-2 border-dashed border-navy-200 bg-white p-8 text-center">
                        <div className="w-12 h-12 bg-navy-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <Upload className="w-5 h-5 text-navy-400" />
                        </div>
                        <p className="text-sm font-semibold text-navy-800 mb-1">{dict.profile.uploadCv}</p>
                        <p className="text-xs text-navy-400 mb-5 max-w-xs mx-auto">{dict.profile.signInToUpload}</p>
                        <button
                          type="button"
                          onClick={handleSignInForUpload}
                          disabled={signingIn}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-800 text-white rounded-xl text-sm font-medium hover:bg-navy-900 disabled:opacity-60 transition-colors"
                        >
                          {signingIn ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> {dict.profile.signingIn}</>
                          ) : (
                            <>
                              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                              </svg>
                              {dict.profile.signInWithGoogle}
                            </>
                          )}
                        </button>
                        <p className="text-xs text-navy-400 mt-4">{dict.profile.manualFallback}</p>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={loadDemo}
                    className="inline-flex items-center gap-2 text-sm text-gold-600 hover:text-gold-700 font-medium transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    {dict.profile.loadDemo}
                  </button>
                </>
              )}

              {/* ── Step 2: Education & Experience ─────────────────────── */}
              {step === 1 && (
                <>
                  <div>
                    <h2 className="text-2xl font-bold text-navy-900 mb-1">
                      {firstName
                        ? `Tell us about your background, ${firstName}.`
                        : "Tell us about your background."}
                    </h2>
                    <p className="text-sm text-navy-500">
                      This helps us understand where you&apos;ve been and where you could go.
                    </p>
                  </div>
                  <div>
                    <label className={labelCls}>{dict.profile.education}</label>
                    <textarea
                      value={profile.education}
                      onChange={(e) => update("education", e.target.value)}
                      placeholder={dict.profile.educationPlaceholder}
                      rows={3}
                      className={inputCls + " resize-none"}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>{dict.profile.workExperience}</label>
                    <textarea
                      value={profile.experience}
                      onChange={(e) => update("experience", e.target.value)}
                      placeholder={dict.profile.workExperiencePlaceholder}
                      rows={5}
                      className={inputCls + " resize-none"}
                    />
                  </div>
                </>
              )}

              {/* ── Step 3: Skills & Interests ─────────────────────────── */}
              {step === 2 && (
                <>
                  <div>
                    <h2 className="text-2xl font-bold text-navy-900 mb-1">
                      {firstName ? `What are you great at, ${firstName}?` : "What are you great at?"}
                    </h2>
                    <p className="text-sm text-navy-500">
                      Tap the skills that apply to you. Add your own if you don&apos;t see them.
                    </p>
                  </div>
                  <div>
                    <label className={labelCls}>{dict.profile.skills}</label>
                    <SkillChipGrid
                      values={profile.skills}
                      onChange={(v) => update("skills", v)}
                      suggestions={skillSuggestions}
                      placeholder={dict.profile.skillsPlaceholder}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>{dict.profile.interests}</label>
                    <TagInput
                      values={profile.interests}
                      onChange={(v) => update("interests", v)}
                      suggestions={interestSuggestions}
                      placeholder={dict.profile.interestsPlaceholder}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>{dict.profile.preferredIndustries}</label>
                    <TagInput
                      values={profile.preferredIndustries}
                      onChange={(v) => update("preferredIndustries", v)}
                      suggestions={industrySuggestions}
                      placeholder={dict.profile.industriesPlaceholder}
                    />
                  </div>
                </>
              )}

              {/* ── Step 4: Preferences ────────────────────────────────── */}
              {step === 3 && (
                <>
                  <div>
                    <h2 className="text-2xl font-bold text-navy-900 mb-1">
                      {firstName ? `Almost done, ${firstName}!` : "Almost done!"}
                    </h2>
                    <p className="text-sm text-navy-500">
                      A few last things to help us match you with the right opportunities.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>{dict.profile.salaryExpectation}</label>
                      <input
                        type="text"
                        value={profile.salaryExpectation}
                        onChange={(e) => update("salaryExpectation", e.target.value)}
                        placeholder={dict.profile.salaryPlaceholder}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>{dict.profile.locationPreference}</label>
                      <input
                        type="text"
                        value={profile.locationPreference}
                        onChange={(e) => update("locationPreference", e.target.value)}
                        placeholder={dict.profile.locationPlaceholder}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>{dict.profile.riskAppetite}</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
                      {riskOptions.map(({ value, label, desc }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => update("riskAppetite", value)}
                          className={`p-4 rounded-xl text-left border-2 transition-all ${
                            profile.riskAppetite === value
                              ? "border-navy-700 bg-navy-700 text-white"
                              : "border-navy-200 bg-white text-navy-700 hover:border-navy-400"
                          }`}
                        >
                          <div className="font-semibold text-sm mb-1">{label}</div>
                          <div className={`text-xs leading-snug ${profile.riskAppetite === value ? "text-navy-200" : "text-navy-400"}`}>
                            {desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>{dict.profile.lifestylePreference}</label>
                    <select
                      value={profile.lifestylePreference}
                      onChange={(e) => update("lifestylePreference", e.target.value as UserProfile["lifestylePreference"])}
                      className={inputCls}
                    >
                      <option value="stability">{dict.profile.lifestyleStability}</option>
                      <option value="flexibility">{dict.profile.lifestyleFlexibility}</option>
                      <option value="fast-growth">{dict.profile.lifestyleFastGrowth}</option>
                      <option value="purpose-driven">{dict.profile.lifestylePurposeDriven}</option>
                    </select>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* ── Navigation ──────────────────────────────────────────────── */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-navy-100">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-navy-200 text-navy-700 text-sm font-medium hover:border-navy-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 0 && !canAdvanceStep1}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-navy-800 text-white text-sm font-medium hover:bg-navy-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <Button
                type="submit"
                size="xl"
                disabled={loading || !profile.name || !profile.currentRole}
              >
                {loading ? (
                  <><Loader2 className="mr-2 w-5 h-5 animate-spin" /> {dict.profile.submitting}</>
                ) : (
                  <>{dict.profile.submit} <ArrowRight className="ml-2 w-5 h-5" /></>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-beige-50 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-navy-400" />
        </div>
      }
    >
      <ProfilePageInner />
    </Suspense>
  );
}
