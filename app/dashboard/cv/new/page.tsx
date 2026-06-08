"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileText, Palette, Upload, PenLine, ChevronRight, ChevronLeft, Loader2,
  Sparkles, Paperclip, AlertCircle, Check, ImageOff,
} from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { initCV, loadBlocks } from "@/store/slices/cvSlice";
import type { CVStyle, CVFormat, CVBlock } from "@/lib/cv-types";
import { DEFAULT_BLOCK_CONTENT, DEFAULT_BLOCK_ORDER, newId } from "@/lib/cv-types";
import { createCVInSupabase } from "@/lib/cv-persist";
import { buildBlocksFromGenerated } from "@/lib/cv-generate";
import { AppTopBar } from "@/components/layout/AppTopBar";
import {
  extractTextFromFile, ExtractionError,
  ACCEPTED_FILE_EXTENSIONS, ACCEPTED_FILE_LABEL, MAX_FILE_SIZE_BYTES,
} from "@/lib/file-extractors";
import { PortfolioEvidenceInput } from "@/components/cv/PortfolioEvidenceInput";
import type { PortfolioEvidence } from "@/lib/portfolio-types";
import { emptyEvidence } from "@/lib/portfolio-types";
import { loadEvidence } from "@/lib/portfolio-store";
import { useLanguage } from "@/components/i18n/LanguageProvider";

type Step = "format" | "style" | "job" | "start";
const STEPS: Step[] = ["format", "style", "job", "start"];

// Labeled stepper — replaces the old anonymous dots so users always know which
// stage of the wizard they're on.
function StepIndicator({ currentIdx, stepLabels, stepXofY }: { currentIdx: number; stepLabels: string[]; stepXofY: string }) {
  return (
    <div className="mb-6">
      <ol className="flex items-center">
        {stepLabels.map((label, i) => {
          const done = i < currentIdx;
          const current = i === currentIdx;
          const isLast = i === stepLabels.length - 1;
          return (
            <li key={label} className={isLast ? "flex items-center" : "flex items-center flex-1"}>
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={[
                    "flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold transition-colors",
                    current ? "bg-[#0a1628] text-white"
                      : done ? "bg-[#d4a017] text-[#0a1628]"
                      : "bg-beige-200 text-navy-400",
                  ].join(" ")}
                >
                  {done ? <Check size={13} /> : i + 1}
                </span>
                <span
                  className={[
                    "hidden sm:inline text-xs font-medium whitespace-nowrap transition-colors",
                    current ? "text-navy-900" : done ? "text-navy-700" : "text-navy-400",
                  ].join(" ")}
                >
                  {label}
                </span>
              </div>
              {!isLast && (
                <span className={["flex-1 h-px mx-2", done ? "bg-[#d4a017]" : "bg-beige-300"].join(" ")} />
              )}
            </li>
          );
        })}
      </ol>
      <p className="sm:hidden text-center text-[11px] text-navy-500 mt-2">
        {stepXofY.replace("{x}", String(currentIdx + 1)).replace("{y}", String(stepLabels.length))} ·{" "}
        <span className="font-semibold text-navy-700">{stepLabels[currentIdx]}</span>
      </p>
    </div>
  );
}

function makeBlock(type: CVBlock["type"]): CVBlock {
  return { id: newId(), type, content: { ...DEFAULT_BLOCK_CONTENT[type] } };
}

function buildDefaultBlocks(): CVBlock[] {
  return DEFAULT_BLOCK_ORDER.map(makeBlock);
}

/** Read the user's saved language preference (set by the i18n LanguageProvider). */
function readLocale(): "en" | "ms" | "zh-CN" {
  try {
    const saved = window.localStorage.getItem("tenun-locale");
    if (saved === "ms") return "ms";
    if (saved === "zh-CN") return "zh-CN";
    return "en";
  } catch {
    return "en";
  }
}

function NewCVFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { dict } = useLanguage();
  const stepLabels = dict.cvNew.stepLabels;

  const uploadMode = searchParams.get("upload") === "true";

  const [step, setStep] = useState<Step>(() => {
    if (uploadMode) return "start";
    if (searchParams.get("style") as CVStyle) return "job";
    return "format";
  });
  const [format, setFormatState] = useState<CVFormat>("resume");
  const [style, setStyleState] = useState<CVStyle>(
    (searchParams.get("style") as CVStyle) ?? "harvard"
  );
  const [targetJob, setTargetJobState] = useState("");
  const [notes, setNotes] = useState("");
  const [genFile, setGenFile] = useState<File | null>(null);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<PortfolioEvidence[]>([]);
  const [extractionFallback, setExtractionFallback] = useState(false);
  const genFileRef = useRef<HTMLInputElement>(null);
  const uploadFileRef = useRef<HTMLInputElement>(null);

  // Restore any portfolio/project evidence the user added previously.
  useEffect(() => {
    setEvidence(loadEvidence());
  }, []);

  const busy = generating || uploading || creating;
  const currentIdx = STEPS.indexOf(step);

  function prev() {
    if (currentIdx > 0) setStep(STEPS[currentIdx - 1]);
  }

  function next() {
    if (currentIdx < STEPS.length - 1) setStep(STEPS[currentIdx + 1]);
  }

  const title = targetJob ? dict.cvNew.cvForTarget.replace("{target}", targetJob) : dict.cvNew.untitledCv;

  // Persist the new CV and move on to the editor. When Supabase isn't
  // configured the save is skipped and the editor runs from Redux state.
  async function finishCreate(blocks: CVBlock[]) {
    const id = newId();
    await createCVInSupabase({ id, title, style, format, targetJob }, blocks);
    dispatch(initCV({ id, title, style, format, targetJob }));
    dispatch(loadBlocks(blocks));
    router.push(`/dashboard/cv/${id}/edit`);
  }

  // Shared extractor — supports PDF (via the server route), DOCX (mammoth) and TXT.
  async function extractText(file: File): Promise<string> {
    return extractTextFromFile(file);
  }

  /** Reveal the portfolio-evidence section with at least one empty project. */
  function startProjectSummary() {
    setExtractionFallback(false);
    setGenFile(null);
    if (evidence.length === 0) setEvidence([emptyEvidence()]);
  }

  async function handleGenerate() {
    setError(null);
    setExtractionFallback(false);

    if (genFile && genFile.size > MAX_FILE_SIZE_BYTES) {
      setError(dict.cvNew.errFileTooLarge);
      return;
    }

    setGenerating(true);
    try {
      let fileText = "";
      if (genFile) {
        try {
          fileText = await extractText(genFile);
        } catch (err) {
          // Image-based / empty file → don't dead-end. Offer the manual fallback.
          if (err instanceof ExtractionError && (err.code === "image_based" || err.code === "empty")) {
            setExtractionFallback(true);
            setGenerating(false);
            return;
          }
          throw err;
        }
      }

      const res = await fetch("/api/generate-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: fileText,
          userNotes: notes,
          portfolioEvidence: evidence,
          targetJob,
          format,
          style,
          locale: readLocale(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || dict.cvNew.errGenerationFailed);
      }

      const { generated } = await res.json();
      await finishCreate(buildBlocksFromGenerated(generated));
    } catch (e) {
      setError(e instanceof Error ? e.message : dict.cvNew.errGeneric);
      setGenerating(false);
    }
  }

  async function handleFresh() {
    setError(null);
    setCreating(true);
    try {
      await finishCreate(buildDefaultBlocks());
    } catch (e) {
      setError(e instanceof Error ? e.message : dict.cvNew.errCreateFailed);
      setCreating(false);
    }
  }

  async function handleUpload(file: File) {
    setError(null);
    setUploading(true);
    try {
      const text = await extractText(file);

      const parseRes = await fetch("/api/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const { profile } = parseRes.ok ? await parseRes.json() : { profile: null };

      const blocks = buildDefaultBlocks();

      const infoBlock = blocks.find((b) => b.type === "personal_info");
      if (infoBlock && profile?.name) infoBlock.content.name = profile.name;

      const summaryBlock = blocks.find((b) => b.type === "summary");
      if (summaryBlock && profile?.experience) summaryBlock.content.text = profile.experience;

      const skillsBlock = blocks.find((b) => b.type === "skills");
      if (skillsBlock && profile?.skills?.length) skillsBlock.content.items = profile.skills;

      await finishCreate(blocks);
    } catch (e) {
      setError(e instanceof Error ? e.message : dict.cvNew.errImportFailed);
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <AppTopBar
        breadcrumbs={[
          { label: dict.cvNew.breadcrumbDashboard, href: "/dashboard" },
          { label: dict.cvNew.breadcrumbCvBuilder, href: "/dashboard/cv" },
          { label: dict.cvNew.breadcrumbNewCv },
        ]}
        actions={
          <Link
            href="/dashboard/cv"
            className="inline-flex items-center gap-1.5 rounded-lg border border-beige-300 bg-white px-3 py-1.5 text-xs font-medium text-navy-700 hover:border-navy-300 transition-colors"
          >
            <ChevronLeft size={14} /> <span className="hidden sm:inline">{dict.cvNew.backToYourCvs}</span>
          </Link>
        }
        returnTo={{ href: "/dashboard", label: dict.cvNew.exitToDashboard }}
      />

      <div className="flex items-start justify-center p-4 pt-8 sm:pt-10">
        <div className="w-full max-w-lg">
          {/* Intro */}
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl text-navy-900">{dict.cvNew.createNewCv}</h1>
            <p className="text-sm text-navy-500 mt-1.5">
              {dict.cvNew.createNewCvSubtitle}
            </p>
          </div>

          <StepIndicator currentIdx={currentIdx} stepLabels={stepLabels} stepXofY={dict.cvNew.stepXofY} />

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Format step */}
          {step === "format" && (
            <StepLayout
              title={dict.cvNew.whatAreYouBuilding}
              subtitle={dict.cvNew.setsPageLimit}
              onNext={next}
              canNext
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([["resume", dict.cvNew.resumeLabel, dict.cvNew.resumeDesc], ["cv", dict.cvNew.cvLabel, dict.cvNew.cvDesc]] as [CVFormat, string, string][]).map(
                  ([val, label, desc]) => (
                    <button
                      key={val}
                      onClick={() => setFormatState(val)}
                      className={[
                        "text-left p-4 rounded-xl border-2 transition-all",
                        format === val ? "border-[#0a1628] bg-[#0a1628]/5" : "border-gray-200 hover:border-gray-300",
                      ].join(" ")}
                    >
                      <p className="font-semibold text-[#0a1628] text-sm">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </button>
                  )
                )}
              </div>
            </StepLayout>
          )}

          {/* Style step */}
          {step === "style" && (
            <StepLayout title={dict.cvNew.pickAStyle} subtitle={dict.cvNew.canSwitchLater} onNext={next} onPrev={prev} canNext>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <StyleCard
                  id="harvard"
                  label={dict.cvNew.harvardLabel}
                  description={dict.cvNew.harvardDesc}
                  icon={<FileText size={20} className="text-[#4164b4]" />}
                  accent="#4164b4"
                  selected={style === "harvard"}
                  onSelect={() => setStyleState("harvard")}
                />
                <StyleCard
                  id="creative"
                  label={dict.cvNew.creativeLabel}
                  description={dict.cvNew.creativeDesc}
                  icon={<Palette size={20} className="text-[#6c5ce7]" />}
                  accent="#6c5ce7"
                  selected={style === "creative"}
                  onSelect={() => setStyleState("creative")}
                />
              </div>
            </StepLayout>
          )}

          {/* Target job step */}
          {step === "job" && (
            <StepLayout
              title={dict.cvNew.whatRole}
              subtitle={dict.cvNew.whatRoleSubtitle}
              onNext={next}
              onPrev={prev}
              canNext
            >
              <input
                type="text"
                value={targetJob}
                onChange={(e) => setTargetJobState(e.target.value)}
                placeholder={dict.cvNew.rolePlaceholder}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#0a1628] placeholder:text-gray-300 focus:outline-none focus:border-[#0a1628] transition-colors"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && next()}
              />
            </StepLayout>
          )}

          {/* Start step */}
          {step === "start" && (
            <StepLayout title={dict.cvNew.howToStart} onPrev={prev} canNext={false}>
              <div className="space-y-3">
                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100">
                    <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-600 leading-snug">{error}</p>
                  </div>
                )}

                {/* Generate with AI — primary */}
                <div className="rounded-xl border-2 border-[#d4a017] bg-[#d4a017]/5 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-[#d4a017]/15 flex items-center justify-center shrink-0">
                      <Sparkles size={18} className="text-[#d4a017]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#0a1628] text-sm flex items-center gap-2">
                        {dict.cvNew.tellTenun}
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-[#d4a017]">{dict.cvNew.recommended}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {dict.cvNew.describeBackground}
                        {" "}{format === "cv" ? "CV" : "resume"}
                        {targetJob ? ` ${dict.cvNew.forWord} ${targetJob}` : ""} {dict.cvNew.youCanEdit}
                      </p>
                    </div>
                  </div>

                  {/* Rough-notes input */}
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder={dict.cvNew.notesPlaceholder}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-xs text-[#0a1628] placeholder:text-gray-300 focus:outline-none focus:border-[#d4a017] focus:ring-2 focus:ring-[#d4a017]/15 transition-all resize-none"
                  />

                  {/* Example starter chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      dict.cvNew.chipSoftwareEngineer,
                      dict.cvNew.chipBackend,
                      dict.cvNew.chipDashboard,
                      dict.cvNew.chipStudentProject,
                    ].map((ex) => (
                      <button
                        key={ex}
                        type="button"
                        onClick={() => setNotes((n) => (n.trim() ? `${n.trim()}. ${ex}` : ex))}
                        className="px-2.5 py-1 rounded-full border border-beige-300 bg-white text-[11px] text-gray-500 hover:border-[#d4a017] hover:text-[#0a1628] transition-colors"
                      >
                        + {ex}
                      </button>
                    ))}
                  </div>

                  {/* Optional file attach */}
                  <button
                    onClick={() => genFileRef.current?.click()}
                    disabled={busy}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-gray-300 bg-white text-left hover:border-[#d4a017] transition-colors disabled:opacity-50"
                  >
                    <Paperclip size={14} className="text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-500 truncate flex-1">
                      {genFile ? genFile.name : `${dict.cvNew.attachExisting} (${ACCEPTED_FILE_LABEL}, ${dict.cvNew.optional})`}
                    </span>
                    {genFile && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => { e.stopPropagation(); setGenFile(null); }}
                        className="text-[11px] text-gray-400 hover:text-red-400 shrink-0"
                      >
                        {dict.cvNew.remove}
                      </span>
                    )}
                  </button>

                  <p className="text-[11px] text-gray-400 leading-snug">
                    {dict.cvNew.bestResultsTip}
                  </p>

                  {/* Image-based / empty file fallback — never a dead end */}
                  {extractionFallback && (
                    <div className="rounded-lg border border-[#d4a017]/40 bg-[#d4a017]/5 p-3 space-y-2.5">
                      <div className="flex items-start gap-2">
                        <ImageOff size={15} className="text-[#a97d12] mt-0.5 shrink-0" aria-hidden="true" />
                        <p className="text-xs text-[#0a1628] leading-snug">
                          {dict.cvNew.extractionFallbackMsg}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={startProjectSummary}
                          className="inline-flex items-center gap-1.5 rounded-md bg-[#0a1628] text-white px-2.5 py-1.5 text-[11px] font-semibold hover:bg-[#1a2a4a] transition-colors"
                        >
                          {dict.cvNew.addProjectSummary}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setExtractionFallback(false); setGenFile(null); genFileRef.current?.click(); }}
                          className="inline-flex items-center gap-1.5 rounded-md border border-beige-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-navy-700 hover:border-navy-300 transition-colors"
                        >
                          {dict.cvNew.tryAnotherFile}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setGenFile(null); setExtractionFallback(false); handleGenerate(); }}
                          className="inline-flex items-center gap-1.5 rounded-md border border-beige-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-navy-700 hover:border-navy-300 transition-colors"
                        >
                          {dict.cvNew.continueWithoutFile}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Optional portfolio / project evidence */}
                  <PortfolioEvidenceInput value={evidence} onChange={setEvidence} />

                  <button
                    onClick={handleGenerate}
                    disabled={busy}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#d4a017] text-[#0a1628] text-sm font-semibold hover:bg-[#e0ad1c] transition-colors disabled:opacity-60"
                  >
                    {generating ? (
                      <><Loader2 size={15} className="animate-spin" /> {`${dict.cvNew.generatingYour} ${format === "cv" ? "CV" : "resume"}…`}</>
                    ) : (
                      <><Sparkles size={15} /> {dict.cvNew.generateCv}</>
                    )}
                  </button>
                </div>

                {/* Secondary options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleFresh}
                    disabled={busy}
                    className="flex items-center gap-2.5 p-3 rounded-xl border-2 border-gray-200 hover:border-[#0a1628] hover:bg-[#0a1628]/5 transition-all text-left disabled:opacity-50"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                      {creating ? <Loader2 size={15} className="animate-spin text-gray-400" /> : <PenLine size={15} className="text-gray-400" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[#0a1628] text-xs">{dict.cvNew.startFresh}</p>
                      <p className="text-[11px] text-gray-400 leading-tight">{dict.cvNew.blankSections}</p>
                    </div>
                  </button>

                  <button
                    onClick={() => uploadFileRef.current?.click()}
                    disabled={busy}
                    className="flex items-center gap-2.5 p-3 rounded-xl border-2 border-gray-200 hover:border-[#0a1628] hover:bg-[#0a1628]/5 transition-all text-left disabled:opacity-50"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                      {uploading ? <Loader2 size={15} className="animate-spin text-gray-400" /> : <Upload size={15} className="text-gray-400" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[#0a1628] text-xs">{dict.cvNew.uploadAndPrefill}</p>
                      <p className="text-[11px] text-gray-400 leading-tight">{dict.cvNew.importWithoutAi}</p>
                    </div>
                  </button>
                </div>

                <input
                  ref={genFileRef}
                  type="file"
                  accept={ACCEPTED_FILE_EXTENSIONS}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) { setGenFile(file); setExtractionFallback(false); setError(null); }
                    e.target.value = "";
                  }}
                />
                <input
                  ref={uploadFileRef}
                  type="file"
                  accept={ACCEPTED_FILE_EXTENSIONS}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                    e.target.value = "";
                  }}
                />
              </div>
            </StepLayout>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Page ----------

export default function NewCVPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-[#0a1628]" />
        </div>
      }
    >
      <NewCVFlow />
    </Suspense>
  );
}

// ---------- Step layout ----------

function StepLayout({
  title, subtitle, children, onNext, onPrev, canNext,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onNext?: () => void;
  onPrev?: () => void;
  canNext: boolean;
}) {
  const { dict } = useLanguage();
  return (
    <div className="p-6 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-[#0a1628]">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
      <div className="flex items-center justify-between pt-2">
        {onPrev ? (
          <button onClick={onPrev} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
            <ChevronLeft size={14} /> {dict.cvNew.back}
          </button>
        ) : <div />}
        {canNext && onNext && (
          <button
            onClick={onNext}
            className="flex items-center gap-1 px-4 py-2 bg-[#0a1628] text-white rounded-lg text-xs font-medium hover:bg-[#1a2a4a] transition-colors"
          >
            {dict.cvNew.continue} <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

// ---------- Style card ----------

function StyleCard({ label, description, icon, accent, selected, onSelect }: {
  id: string; label: string; description: string;
  icon: React.ReactNode; accent: string; selected: boolean; onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="text-left p-4 rounded-xl border-2 transition-all"
      style={{ borderColor: selected ? accent : undefined }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.borderColor = "#e5e7eb"; }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.borderColor = ""; }}
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: accent + "15" }}>
        {icon}
      </div>
      <p className="font-semibold text-[#0a1628] text-xs">{label}</p>
      <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{description}</p>
    </button>
  );
}
