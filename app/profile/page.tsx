"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  GraduationCap,
  Cpu,
  Sun,
  ArrowRight,
  Loader2,
  Sparkles,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setInput("");
    setShowSuggestions(false);
  };

  const removeTag = (tag: string) => {
    onChange(values.filter((v) => v !== tag));
  };

  const filtered = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(input.toLowerCase()) && !values.includes(s)
  );

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((v) => (
          <Badge key={v} variant="secondary" className="cursor-pointer group">
            {v}
            <button
              onClick={() => removeTag(v)}
              className="ml-1 opacity-60 group-hover:opacity-100"
            >
              &times;
            </button>
          </Badge>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input.trim()) addTag(input);
          }
        }}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-lg border border-navy-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all"
      />
      {showSuggestions && input && filtered.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-navy-100 rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {filtered.slice(0, 8).map((s) => (
            <button
              key={s}
              onClick={() => addTag(s)}
              className="w-full text-left px-4 py-2 text-sm hover:bg-navy-50 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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

  React.useEffect(() => {
    const job = sessionStorage.getItem("tenun-target-job");
    if (job) setTargetJob(job);
  }, []);

  // When arriving via ?upload=true, scroll to the upload card and highlight it
  useEffect(() => {
    if (!uploadMode) return;
    const scrollTimer = setTimeout(() => {
      uploadSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
    setHighlightUpload(true);
    const highlightTimer = setTimeout(() => setHighlightUpload(false), 3000);
    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(highlightTimer);
    };
  }, [uploadMode]);

  // Check auth status — only needed to gate the CV upload
  React.useEffect(() => {
    const supabase = createClient();
    if (!supabase) { setIsLoggedIn(true); return; } // local dev with no Supabase
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignInForUpload() {
    setSigningIn(true);
    try {
      await signInWithGoogle("/profile");
    } catch {
      setSigningIn(false);
    }
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

  // Prefill from a previously saved profile so users returning to edit/upload
  // don't see a blank form
  useEffect(() => {
    const stored = sessionStorage.getItem("tenun-profile");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as Partial<UserProfile>;
      setProfile((prev) => ({ ...prev, ...parsed }));
    } catch {
      /* ignore malformed stored profile */
    }
  }, []);

  const update = <K extends keyof UserProfile>(
    key: K,
    value: UserProfile[K]
  ) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const loadDemo = () => {
    setProfile(demoProfile);
  };

  const applyParsedProfile = (parsed: Partial<UserProfile>) => {
    setProfile((prev) => {
      const merged = { ...prev };
      if (parsed.name && !prev.name) merged.name = parsed.name;
      if (parsed.currentRole && !prev.currentRole)
        merged.currentRole = parsed.currentRole;
      if (parsed.education && !prev.education)
        merged.education = parsed.education;
      if (parsed.experience && !prev.experience)
        merged.experience = parsed.experience;
      if (parsed.locationPreference && !prev.locationPreference)
        merged.locationPreference = parsed.locationPreference;
      // Merge arrays (union with existing)
      if (parsed.skills)
        merged.skills = [...new Set([...prev.skills, ...parsed.skills])];
      if (parsed.interests)
        merged.interests = [
          ...new Set([...prev.interests, ...parsed.interests]),
        ];
      if (parsed.preferredIndustries)
        merged.preferredIndustries = [
          ...new Set([
            ...prev.preferredIndustries,
            ...parsed.preferredIndustries,
          ]),
        ];
      if (parsed.resumeText) merged.resumeText = parsed.resumeText;
      return merged;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Store profile in sessionStorage for dashboard to pick up
    sessionStorage.setItem("tenun-profile", JSON.stringify(profile));
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  const inputCls =
    "w-full px-4 py-2.5 rounded-lg border border-navy-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-500 transition-all";
  const labelCls = "block text-sm font-medium text-navy-800 mb-1.5";

  return (
    <div className="min-h-screen bg-beige-50">
      <Navbar />

      <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6">
        <SubNavBar
          className="mb-8"
          breadcrumbs={[{ label: dict.profile.breadcrumbDashboard, href: "/dashboard" }, { label: dict.profile.breadcrumbProfile }]}
          returnTo={getDashboardReturn(pathname, { loggedIn: isLoggedIn, labels: dict.navLabels })}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          {targetJob && (
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 mb-4">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-emerald-700 font-medium">
                {dict.profile.exploring} <strong>{targetJob}</strong>
              </span>
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-2">
            {targetJob ? dict.profile.fitTitle : dict.profile.buildTitle}
          </h1>
          <p className="text-navy-500 max-w-xl mx-auto">
            {dict.profile.subtitle}{" "}
            {targetJob
              ? dict.profile.subtitleTargeted.replace("{target}", targetJob)
              : dict.profile.subtitleGeneric}.
          </p>
          <button
            onClick={loadDemo}
            className="mt-4 inline-flex items-center gap-2 text-sm text-gold-600 hover:text-gold-700 font-medium transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            {dict.profile.loadDemo}
          </button>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* CV Upload — requires sign in */}
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
              <p className="text-xs text-navy-400 mb-5 max-w-xs mx-auto">
                {dict.profile.signInToUpload}
              </p>
              <button
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
              <p className="text-xs text-navy-400 mt-4">
                {dict.profile.manualFallback}
              </p>
            </div>
          )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-navy-100" />
            <span className="text-xs text-navy-400 font-medium">{dict.profile.manualDivider}</span>
            <div className="flex-1 h-px bg-navy-100" />
          </div>

          {/* Basic info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-navy-600" />
                {dict.profile.basicInfo}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* Education & Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="w-5 h-5 text-navy-600" />
                {dict.profile.educationExperience}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className={labelCls}>{dict.profile.education}</label>
                <textarea
                  value={profile.education}
                  onChange={(e) => update("education", e.target.value)}
                  placeholder={dict.profile.educationPlaceholder}
                  rows={2}
                  className={inputCls + " resize-none"}
                />
              </div>
              <div>
                <label className={labelCls}>{dict.profile.workExperience}</label>
                <textarea
                  value={profile.experience}
                  onChange={(e) => update("experience", e.target.value)}
                  placeholder={dict.profile.workExperiencePlaceholder}
                  rows={4}
                  className={inputCls + " resize-none"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills & Interests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Cpu className="w-5 h-5 text-navy-600" />
                {dict.profile.skillsInterests}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className={labelCls}>{dict.profile.skills}</label>
                <TagInput
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
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sun className="w-5 h-5 text-navy-600" />
                {dict.profile.preferences}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    onChange={(e) =>
                      update("locationPreference", e.target.value)
                    }
                    placeholder={dict.profile.locationPlaceholder}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>{dict.profile.riskAppetite}</label>
                  <div className="flex gap-2">
                    {(["low", "medium", "high"] as const).map((r) => {
                      const riskLabels = { low: dict.profile.riskLow, medium: dict.profile.riskMedium, high: dict.profile.riskHigh };
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => update("riskAppetite", r)}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${
                            profile.riskAppetite === r
                              ? "border-navy-700 bg-navy-700 text-white"
                              : "border-navy-200 text-navy-600 hover:border-navy-400"
                          }`}
                        >
                          {riskLabels[r]}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>{dict.profile.lifestylePreference}</label>
                  <select
                    value={profile.lifestylePreference}
                    onChange={(e) =>
                      update(
                        "lifestylePreference",
                        e.target.value as UserProfile["lifestylePreference"]
                      )
                    }
                    className={inputCls}
                  >
                    <option value="stability">{dict.profile.lifestyleStability}</option>
                    <option value="flexibility">{dict.profile.lifestyleFlexibility}</option>
                    <option value="fast-growth">{dict.profile.lifestyleFastGrowth}</option>
                    <option value="purpose-driven">{dict.profile.lifestylePurposeDriven}</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              size="xl"
              disabled={loading || !profile.name || !profile.currentRole}
              className="w-full sm:w-auto min-w-[280px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                  {dict.profile.submitting}
                </>
              ) : (
                <>
                  {dict.profile.submit}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        </motion.form>
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
