"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Loader2,
  Sparkles,
  Upload,
  X,
  Plus,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { UserProfile } from "@/lib/types";
import { extractTextFromFile } from "@/lib/file-extractors";
import { createClient } from "@/lib/supabase/client";
import { signInWithGoogle } from "@/lib/use-auth";
import {
  ProfileFormData,
  ParsedProfileFormData,
  EducationEntry,
  ExperienceEntry,
  emptyProfileForm,
  emptyEducationEntry,
  emptyExperienceEntry,
  getAishaDemoFormData,
  applyParsedProfileToForm,
  getMissingImportantFields,
  profileFormToUserProfile,
  userProfileToFormPartial,
  WORKING_STYLES,
} from "@/lib/profile-form";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const STEP_LABELS = [
  "Basic Information",
  "Education & Experiences",
  "Skills & Interest",
  "Preferences",
] as const;

// ── Step breadcrumb ───────────────────────────────────────────────────────────
function StepBreadcrumb({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center flex-wrap gap-y-3 mb-10">
      {STEP_LABELS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={label}>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                  done
                    ? "bg-green-500 text-white"
                    : active
                    ? "bg-[#0a1628] text-white"
                    : "border-2 border-gray-300 text-gray-400 bg-white"
                }`}
              >
                {done ? "✓" : i + 1}
              </div>
              <span
                className={`text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                  active
                    ? "text-[#0a1628] font-semibold"
                    : done
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <ArrowRight
                className={`w-3.5 h-3.5 mx-2 flex-shrink-0 ${
                  done ? "text-green-400" : "text-gray-300"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Tag chip input ────────────────────────────────────────────────────────────
function TagChipInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  const add = () => {
    const t = input.trim();
    if (t && !values.includes(t)) onChange([...values, t]);
    setInput("");
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors"
      />
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gray-300 bg-white text-sm text-gray-700"
          >
            <button
              type="button"
              onClick={() => onChange(values.filter((x) => x !== v))}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3" />
            </button>
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputCls =
  "w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors";
const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

// ── Main component ────────────────────────────────────────────────────────────
function ProfilePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dict } = useLanguage();

  const [step, setStep] = useState(0);
  const [showIntro, setShowIntro] = useState(
    () => searchParams.get("skipIntro") !== "true"
  );
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  // Intro upload state
  const introFileRef = useRef<HTMLInputElement>(null);
  const [introUploadState, setIntroUploadState] = useState<
    "idle" | "dragging" | "uploading" | "success" | "error"
  >("idle");
  const [introError, setIntroError] = useState("");

  // Single source of truth for the whole wizard (see lib/profile-form.ts).
  const [form, setForm] = useState<ProfileFormData>(emptyProfileForm);
  const [locationInput, setLocationInput] = useState("");
  // Important fields a real CV did not supply — shown so the user fills them in.
  const [missingFields, setMissingFields] = useState<string[]>([]);

  // ── Form field updaters ─────────────────────────────────────────────────────
  const setField = <K extends keyof ProfileFormData>(
    key: K,
    value: ProfileFormData[K]
  ) => setForm((f) => ({ ...f, [key]: value }));

  const setEdu = (i: number, patch: Partial<EducationEntry>) =>
    setForm((f) => ({
      ...f,
      education: f.education.map((x, j) => (j === i ? { ...x, ...patch } : x)),
    }));
  const addEdu = () =>
    setForm((f) => ({ ...f, education: [...f.education, emptyEducationEntry()] }));
  const removeEdu = (i: number) =>
    setForm((f) => ({ ...f, education: f.education.filter((_, j) => j !== i) }));

  const setExp = (i: number, patch: Partial<ExperienceEntry>) =>
    setForm((f) => ({
      ...f,
      experience: f.experience.map((x, j) => (j === i ? { ...x, ...patch } : x)),
    }));
  const addExp = () =>
    setForm((f) => ({ ...f, experience: [...f.experience, emptyExperienceEntry()] }));
  const removeExp = (i: number) =>
    setForm((f) => ({ ...f, experience: f.experience.filter((_, j) => j !== i) }));

  const addLocation = () => {
    const t = locationInput.trim();
    if (!t) return;
    setForm((f) => ({ ...f, locations: [...f.locations, t] }));
    setLocationInput("");
  };
  const removeLocation = (loc: string) =>
    setForm((f) => ({ ...f, locations: f.locations.filter((l) => l !== loc) }));

  // Auth + stored profile
  useEffect(() => {
    const stored = sessionStorage.getItem("tenun-profile");
    if (stored) {
      try {
        const p = JSON.parse(stored) as Partial<UserProfile>;
        setForm((f) => ({ ...f, ...userProfileToFormPartial(p) }));
      } catch {}
    }
    const supabase = createClient();
    if (!supabase) { setIsLoggedIn(true); return; }
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_e, session) => setIsLoggedIn(!!session?.user)
    );
    return () => subscription.unsubscribe();
  }, []);

  // Demo data may be COMPLETE + FICTIONAL — fill every field so the wizard looks
  // properly populated (this is intentional, see lib/profile-form.ts).
  const loadDemo = () => {
    setForm(getAishaDemoFormData());
    setMissingFields([]);
    setStep(0);
    setShowIntro(false);
  };

  async function handleSignInForUpload() {
    setSigningIn(true);
    try {
      await signInWithGoogle("/profile");
    } catch {
      setSigningIn(false);
    }
  }

  const handleIntroFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setIntroError("File is too large (max 5MB).");
      setIntroUploadState("error");
      return;
    }
    setIntroUploadState("uploading");
    setIntroError("");
    try {
      const text = await extractTextFromFile(file);
      const res = await fetch("/api/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = res.ok ? await res.json() : { form: null };
      // Parsed CV data is EVIDENCE-BASED: only fields the CV actually contained
      // are filled. Whatever is missing stays empty and is surfaced below.
      const parsed: Partial<ParsedProfileFormData> | null = data.form ?? null;
      if (parsed) {
        const merged = applyParsedProfileToForm({ ...parsed, resumeText: text }, form);
        setForm(merged);
        setMissingFields(getMissingImportantFields(merged));
      } else {
        // Parser unavailable/failed — keep the raw CV text so nothing is lost.
        setForm((f) => ({ ...f, resumeText: text }));
      }
      setIntroUploadState("success");
    } catch (e) {
      setIntroError(e instanceof Error ? e.message : "Failed to process file.");
      setIntroUploadState("error");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Serialize the wizard form into the dashboard-facing UserProfile.
    const finalProfile = profileFormToUserProfile(form);
    sessionStorage.setItem("tenun-profile", JSON.stringify(finalProfile));
    setTimeout(() => router.push("/dashboard"), 1500);
  };

  // ── Intro screen (step 0) ──────────────────────────────────────────────────
  if (showIntro) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-24 pb-16 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#0a1628] mb-4 max-w-2xl mx-auto leading-tight">
            Start weaving your career now
          </h1>
          <p className="text-gray-500 mb-8 max-w-lg mx-auto text-base">
            Drop your resume and Tenun will extract your information, map your
            experience, and match you with your target roles.
          </p>

          <button
            type="button"
            onClick={loadDemo}
            className="mb-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Load demo profile (Aisha Lim)
          </button>

          <div className="bg-[#f0f0f0] rounded-2xl p-8 max-w-2xl mx-auto mb-6">
            <p className="text-base font-semibold text-[#0a1628] mb-6">
              Upload your CV / Resume
            </p>

            {isLoggedIn ? (
              introUploadState === "success" ? (
                <div className="flex flex-col items-center gap-4 py-4">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                  <p className="text-base font-semibold text-[#0a1628]">
                    Profile extracted!
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowIntro(false)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0a1628] text-white text-sm font-medium hover:bg-[#1a2a48] transition-colors"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : introUploadState === "error" ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <AlertCircle className="w-10 h-10 text-red-400" />
                  <p className="text-sm text-red-600">{introError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIntroUploadState("idle");
                      setIntroError("");
                    }}
                    className="text-sm text-gray-500 underline"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <div
                  onDrop={(e) => {
                    e.preventDefault();
                    setIntroUploadState("idle");
                    const f = e.dataTransfer.files[0];
                    if (f) handleIntroFile(f);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIntroUploadState("dragging");
                  }}
                  onDragLeave={() =>
                    setIntroUploadState((s) => (s === "dragging" ? "idle" : s))
                  }
                  onClick={() => introFileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-10 cursor-pointer transition-all ${
                    introUploadState === "dragging"
                      ? "border-[#0a1628] bg-white/80"
                      : "border-gray-300 bg-white hover:border-[#0a1628]"
                  }`}
                >
                  {introUploadState === "uploading" ? (
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full border-2 border-gray-800 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-gray-800" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">
                        Choose a file or drag &amp; drop it here
                      </p>
                      <p className="text-xs text-gray-400">
                        PDF, DOCX or TXT (max 5MB file size)
                      </p>
                    </div>
                  )}
                  <input
                    ref={introFileRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleIntroFile(f);
                      e.target.value = "";
                    }}
                  />
                </div>
              )
            ) : (
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-xl p-10 border-gray-300 bg-white opacity-50 cursor-not-allowed">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full border-2 border-gray-800 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-gray-800" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      Choose a file or drag &amp; drop it here
                    </p>
                    <p className="text-xs text-gray-400">
                      PDF, DOCX or TXT (max 5MB file size)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSignInForUpload}
                  disabled={signingIn}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#0a1628] text-white rounded-xl text-sm font-medium hover:bg-[#1a2a48] disabled:opacity-60 transition-colors"
                >
                  {signingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      {dict.profile.signInWithGoogle}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowIntro(false)}
            className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
          >
            Don&apos;t have a CV / Resume ready?
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Wizard (steps 1–4) ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6">
        <form onSubmit={handleSubmit}>
          <div className="bg-[#f0f0f0] rounded-2xl p-6 sm:p-8">
            <StepBreadcrumb current={step} />

            {/* "Still needed" note after a real CV parse — never shown for demo data. */}
            {missingFields.length > 0 && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800">
                    We filled what we could from your CV.
                  </p>
                  <p className="text-amber-700">
                    Please review and complete: {missingFields.join(", ")}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMissingFields([])}
                  className="ml-auto text-amber-400 hover:text-amber-600"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ── Step 1: Basic Information ── */}
            {step === 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Left */}
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Full Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      placeholder="e.g. Aisha Lim"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Contact Number *</label>
                    <div className="flex gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 whitespace-nowrap">
                        🇲🇾 +60
                      </span>
                      <input
                        type="tel"
                        value={form.contactNumber}
                        onChange={(e) => setField("contactNumber", e.target.value)}
                        placeholder="Mobile Number"
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Email *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      placeholder="e.g. aishalim@gmail.com"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Current Role *</label>
                    <input
                      type="text"
                      required
                      value={form.currentRole}
                      onChange={(e) => setField("currentRole", e.target.value)}
                      placeholder="e.g. UX Designer"
                      className={inputCls}
                    />
                  </div>
                </div>
                {/* Right — Description only */}
                <div className="flex flex-col">
                  <label className={labelCls}>Description *</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setField("description", e.target.value)}
                    placeholder="Write a brief introduction to tell who you are"
                    className={inputCls + " resize-none flex-1 min-h-[220px]"}
                  />
                </div>
              </div>
            )}

            {/* ── Step 2: Education & Experiences ── */}
            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Education */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-800">Education *</h3>
                  {form.education.map((entry, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 space-y-3">
                      <div>
                        <label className={labelCls}>School *</label>
                        <input
                          type="text"
                          value={entry.school}
                          onChange={(e) => setEdu(i, { school: e.target.value })}
                          placeholder="e.g. Universiti Malaya"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Field of Study *</label>
                        <input
                          type="text"
                          value={entry.fieldOfStudy}
                          onChange={(e) => setEdu(i, { fieldOfStudy: e.target.value })}
                          placeholder="e.g. Computer Science"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Qualification *</label>
                        <input
                          type="text"
                          value={entry.qualification}
                          onChange={(e) => setEdu(i, { qualification: e.target.value })}
                          placeholder="e.g. Bachelor's Degree"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Year *</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={entry.startYear}
                            onChange={(e) => setEdu(i, { startYear: e.target.value })}
                            placeholder="Start Year"
                            className={inputCls}
                          />
                          <input
                            type="text"
                            value={entry.endYear}
                            onChange={(e) => setEdu(i, { endYear: e.target.value })}
                            placeholder="End Year"
                            className={inputCls}
                          />
                        </div>
                      </div>
                      {form.education.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEdu(i)}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={addEdu}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-gray-800 text-sm font-medium text-gray-800 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>

                {/* Experiences */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-800">Experiences *</h3>
                  {form.experience.map((entry, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 space-y-3">
                      <div>
                        <label className={labelCls}>Company *</label>
                        <input
                          type="text"
                          value={entry.company}
                          onChange={(e) => setExp(i, { company: e.target.value })}
                          placeholder="e.g. Tenun"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Role *</label>
                        <input
                          type="text"
                          value={entry.role}
                          onChange={(e) => setExp(i, { role: e.target.value })}
                          placeholder="e.g. UX Designer"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Description *</label>
                        <input
                          type="text"
                          value={entry.description}
                          onChange={(e) => setExp(i, { description: e.target.value })}
                          placeholder="Share what you have learnt from this company"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Year *</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={entry.startYear}
                            onChange={(e) => setExp(i, { startYear: e.target.value })}
                            placeholder="Start Year"
                            className={inputCls}
                          />
                          <input
                            type="text"
                            value={entry.endYear}
                            onChange={(e) => setExp(i, { endYear: e.target.value })}
                            placeholder="End Year"
                            className={inputCls}
                          />
                        </div>
                      </div>
                      {form.experience.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExp(i)}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={addExp}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-gray-800 text-sm font-medium text-gray-800 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Skills & Interest ── */}
            {step === 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-4">Skills *</h3>
                  <div className="bg-white rounded-xl p-4">
                    <label className={labelCls}>Skill *</label>
                    <TagChipInput
                      values={form.skills}
                      onChange={(v) => setField("skills", v)}
                      placeholder="Type a skill and press Enter"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-4">Interest *</h3>
                  <div className="bg-white rounded-xl p-4">
                    <label className={labelCls}>Interest *</label>
                    <TagChipInput
                      values={form.interests}
                      onChange={(v) => setField("interests", v)}
                      placeholder="Type an interest and press Enter"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 4: Preferences ── */}
            {step === 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Left */}
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Salary Expectation *</label>
                    <input
                      type="text"
                      value={form.salaryExpectation}
                      onChange={(e) => setField("salaryExpectation", e.target.value)}
                      placeholder="e.g. RM5,000 - RM8,000"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Working Style Preference *</label>
                    <select
                      value={form.workingStyle}
                      onChange={(e) =>
                        setField("workingStyle", e.target.value as ProfileFormData["workingStyle"])
                      }
                      className={inputCls}
                    >
                      {WORKING_STYLES.map((ws) => (
                        <option key={ws}>{ws}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Availability *</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={form.availabilityYear}
                        onChange={(e) => setField("availabilityYear", e.target.value)}
                        placeholder="Year"
                        className={inputCls}
                      />
                      <input
                        type="text"
                        value={form.availabilityMonth}
                        onChange={(e) => setField("availabilityMonth", e.target.value)}
                        placeholder="Month"
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Risk Appetite *</label>
                    <select
                      value={form.riskAppetite}
                      onChange={(e) =>
                        setField("riskAppetite", e.target.value as ProfileFormData["riskAppetite"])
                      }
                      className={inputCls}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                {/* Right */}
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Lifestyle Preference *</label>
                    <select
                      value={form.lifestylePreference}
                      onChange={(e) =>
                        setField(
                          "lifestylePreference",
                          e.target.value as ProfileFormData["lifestylePreference"]
                        )
                      }
                      className={inputCls}
                    >
                      <option value="flexibility">Flexibility</option>
                      <option value="stability">Stability</option>
                      <option value="fast-growth">Fast Growth</option>
                      <option value="purpose-driven">Purpose Driven</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Location Preference *</label>
                    <div className="bg-white rounded-xl p-4 space-y-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1.5">
                          Location *
                        </label>
                        <input
                          type="text"
                          value={locationInput}
                          onChange={(e) => setLocationInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addLocation();
                            }
                          }}
                          placeholder="e.g. Kuala Lumpur"
                          className={inputCls}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {form.locations.map((loc) => (
                          <span
                            key={loc}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gray-300 bg-gray-50 text-sm text-gray-700"
                          >
                            {loc}
                            <button
                              type="button"
                              onClick={() => removeLocation(loc)}
                            >
                              <X className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={addLocation}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-gray-800 text-sm font-medium text-gray-800 hover:bg-gray-800 hover:text-white transition-colors"
                        >
                          <Plus className="w-4 h-4" /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Navigation ── */}
            <div className="flex justify-end mt-8">
              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  className="px-6 py-2.5 rounded-full bg-[#0a1628] text-white text-sm font-semibold hover:bg-[#1a2a48] transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !form.name || !form.currentRole}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0a1628] text-white text-sm font-semibold hover:bg-[#1a2a48] disabled:opacity-60 transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    "Start Weaving"
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      }
    >
      <ProfilePageInner />
    </Suspense>
  );
}
