"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { nanoid } from "@reduxjs/toolkit";
import { FileText, Palette, Upload, PenLine, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAppDispatch } from "@/store/hooks";
import { initCV, loadBlocks, setStyle, setFormat, setTargetJob } from "@/store/slices/cvSlice";
import type { CVStyle, CVFormat, CVBlock } from "@/lib/cv-types";
import { DEFAULT_BLOCK_CONTENT, DEFAULT_BLOCK_ORDER } from "@/lib/cv-types";

type Step = "format" | "style" | "job" | "start";
const STEPS: Step[] = ["format", "style", "job", "start"];

function makeBlock(type: CVBlock["type"]): CVBlock {
  return { id: nanoid(), type, content: { ...DEFAULT_BLOCK_CONTENT[type] } };
}

function buildDefaultBlocks(): CVBlock[] {
  return DEFAULT_BLOCK_ORDER.map(makeBlock);
}

function NewCVFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const [step, setStep] = useState<Step>(
    (searchParams.get("style") as CVStyle) ? "job" : "format"
  );
  const [format, setFormatState] = useState<CVFormat>("resume");
  const [style, setStyleState] = useState<CVStyle>(
    (searchParams.get("style") as CVStyle) ?? "harvard"
  );
  const [targetJob, setTargetJobState] = useState("");
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const currentIdx = STEPS.indexOf(step);

  function prev() {
    if (currentIdx > 0) setStep(STEPS[currentIdx - 1]);
  }

  function next() {
    if (currentIdx < STEPS.length - 1) setStep(STEPS[currentIdx + 1]);
  }

  async function createCVInDB(blocks: CVBlock[]): Promise<string | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const id = nanoid();
    const { error } = await supabase.from("cvs").insert({
      id,
      title: targetJob ? `CV for ${targetJob}` : "Untitled CV",
      style,
      format,
      target_job: targetJob || null,
    });
    if (error) return null;

    const blockRows = blocks.map((b, i) => ({
      id: b.id,
      cv_id: id,
      type: b.type,
      content: b.content,
      position: i,
    }));
    await supabase.from("cv_blocks").insert(blockRows);
    return id;
  }

  async function handleFresh() {
    setCreating(true);
    const blocks = buildDefaultBlocks();
    const id = await createCVInDB(blocks);
    if (!id) { setCreating(false); return; }

    dispatch(initCV({ id, title: targetJob ? `CV for ${targetJob}` : "Untitled CV", style, format, targetJob }));
    dispatch(loadBlocks(blocks));
    router.push(`/dashboard/cv/${id}/edit`);
  }

  async function handleUpload(file: File) {
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const extractRes = await fetch("/api/extract-text", { method: "POST", body: formData });
      const { text } = await extractRes.json();

      const parseRes = await fetch("/api/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const { profile } = await parseRes.json();

      const blocks = buildDefaultBlocks();

      // Pre-fill personal info block
      const infoBlock = blocks.find((b) => b.type === "personal_info");
      if (infoBlock && profile?.name) infoBlock.content.name = profile.name;

      // Pre-fill summary
      const summaryBlock = blocks.find((b) => b.type === "summary");
      if (summaryBlock && profile?.experience) summaryBlock.content.text = profile.experience;

      // Pre-fill skills
      const skillsBlock = blocks.find((b) => b.type === "skills");
      if (skillsBlock && profile?.skills?.length) skillsBlock.content.items = profile.skills;

      const id = await createCVInDB(blocks);
      if (!id) { setUploading(false); return; }

      dispatch(initCV({ id, title: targetJob ? `CV for ${targetJob}` : "Untitled CV", style, format, targetJob }));
      dispatch(loadBlocks(blocks));
      router.push(`/dashboard/cv/${id}/edit`);
    } catch {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={[
                  "w-2 h-2 rounded-full transition-all",
                  i === currentIdx
                    ? "bg-[#0a1628] w-6"
                    : i < currentIdx
                    ? "bg-[#d4a017]"
                    : "bg-gray-300",
                ].join(" ")}
              />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Format step */}
          {step === "format" && (
            <StepLayout
              title="What are you building?"
              subtitle="This sets the page limit."
              onNext={next}
              canNext
            >
              <div className="grid grid-cols-2 gap-3">
                {([["resume", "Resume", "1 page — concise and direct"], ["cv", "CV", "2 pages — full detail"]] as const).map(
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
            <StepLayout title="Pick a style" subtitle="You can switch later." onNext={next} onPrev={prev} canNext>
              <div className="grid grid-cols-2 gap-3">
                <StyleCard
                  id="harvard"
                  label="Harvard / ATS"
                  description="Clean layout, optimised for applicant tracking systems."
                  icon={<FileText size={20} className="text-[#4164b4]" />}
                  accent="#4164b4"
                  selected={style === "harvard"}
                  onSelect={() => setStyleState("harvard")}
                />
                <StyleCard
                  id="creative"
                  label="Creative / Visual"
                  description="Two-column layout with colour accents and portfolio."
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
              title="What role are you targeting?"
              subtitle="Optional — helps us tailor your CV sections."
              onNext={next}
              onPrev={prev}
              canNext
            >
              <input
                type="text"
                value={targetJob}
                onChange={(e) => setTargetJobState(e.target.value)}
                placeholder="e.g. Product Manager, UX Designer..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#0a1628] placeholder:text-gray-300 focus:outline-none focus:border-[#0a1628] transition-colors"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && next()}
              />
            </StepLayout>
          )}

          {/* Start step */}
          {step === "start" && (
            <StepLayout title="How do you want to start?" onPrev={prev} canNext={false}>
              <div className="space-y-3">
                <button
                  onClick={handleFresh}
                  disabled={creating}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-[#0a1628] hover:bg-[#0a1628]/5 transition-all text-left disabled:opacity-50"
                >
                  <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                    {creating ? <Loader2 size={18} className="animate-spin text-gray-400" /> : <PenLine size={18} className="text-gray-400" />}
                  </div>
                  <div>
                    <p className="font-medium text-[#0a1628] text-sm">Start fresh</p>
                    <p className="text-xs text-gray-400">Blank canvas with suggested sections</p>
                  </div>
                </button>

                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-[#0a1628] hover:bg-[#0a1628]/5 transition-all text-left disabled:opacity-50"
                >
                  <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                    {uploading ? <Loader2 size={18} className="animate-spin text-gray-400" /> : <Upload size={18} className="text-gray-400" />}
                  </div>
                  <div>
                    <p className="font-medium text-[#0a1628] text-sm">Upload my existing CV</p>
                    <p className="text-xs text-gray-400">PDF only — we pre-fill the blocks for you</p>
                  </div>
                </button>

                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                  }}
                />
              </div>
            </StepLayout>
          )}
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
            <ChevronLeft size={14} /> Back
          </button>
        ) : <div />}
        {canNext && onNext && (
          <button
            onClick={onNext}
            className="flex items-center gap-1 px-4 py-2 bg-[#0a1628] text-white rounded-lg text-xs font-medium hover:bg-[#1a2a4a] transition-colors"
          >
            Continue <ChevronRight size={14} />
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
