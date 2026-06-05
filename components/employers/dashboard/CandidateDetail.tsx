"use client";

import { useRef } from "react";
import {
  Sparkles, FileText, FolderGit2, CalendarClock, MessageCircle,
  MapPin, Clock, Wallet, GraduationCap, Briefcase, Target,
  AlertTriangle, CheckCircle2, ExternalLink,
} from "lucide-react";
import type { CandidateSearchResult } from "@/lib/employer-candidates";

interface CandidateDetailProps {
  result: CandidateSearchResult;
  selectedSlotLabel: string | null;
  introSent: boolean;
  onViewCV: () => void;
  onBookMeeting: () => void;
  onSendIntro: () => void;
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <span className="text-gold-600">{icon}</span>
      <h4 className="text-sm font-bold text-navy-900">{children}</h4>
    </div>
  );
}

export function CandidateDetail({
  result, selectedSlotLabel, introSent, onViewCV, onBookMeeting, onSendIntro,
}: CandidateDetailProps) {
  const { candidate, score, matchedTerms } = result;
  const projectsRef = useRef<HTMLDivElement>(null);

  const viewProjects = () =>
    projectsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="rounded-3xl border border-beige-300/60 bg-white overflow-hidden">
      {/* Header */}
      <div className="p-5 bg-gradient-to-br from-navy-900 to-navy-800 text-white">
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 text-white text-lg font-bold flex items-center justify-center shrink-0">
            {candidate.initials}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold leading-tight">{candidate.name}</h3>
            <p className="text-xs text-navy-200 mt-0.5">{candidate.headline}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-300/30 text-[11px] font-semibold text-emerald-100">
                {candidate.intentSignal}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-gold-500/20 border border-gold-300/30 text-[11px] font-semibold text-gold-100">
                {candidate.readiness}
              </span>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-2xl font-black text-gold-400 leading-none">{score}%</div>
            <p className="text-[10px] text-navy-300 uppercase tracking-wide mt-0.5">match</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 text-[11px] text-navy-200">
          <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {candidate.location}</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {candidate.availability}</span>
          <span className="inline-flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5" /> {candidate.salaryExpectation}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2 p-4 border-b border-beige-200">
        <button
          onClick={onViewCV}
          className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-navy-200 text-navy-800 text-xs font-semibold hover:border-navy-900 hover:bg-navy-50 transition-all"
        >
          <FileText className="w-4 h-4" /> View CV
        </button>
        <button
          onClick={viewProjects}
          className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-navy-200 text-navy-800 text-xs font-semibold hover:border-navy-900 hover:bg-navy-50 transition-all"
        >
          <FolderGit2 className="w-4 h-4" /> View Projects
        </button>
        <button
          onClick={onBookMeeting}
          className={[
            "inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all",
            selectedSlotLabel
              ? "bg-emerald-50 border border-emerald-300 text-emerald-700"
              : "border border-navy-200 text-navy-800 hover:border-navy-900 hover:bg-navy-50",
          ].join(" ")}
        >
          <CalendarClock className="w-4 h-4" />
          {selectedSlotLabel ? "Meeting set" : "Book Meeting"}
        </button>
        <button
          onClick={onSendIntro}
          className={[
            "inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all",
            introSent
              ? "bg-emerald-600 text-white"
              : "bg-gold-500 text-navy-900 hover:bg-gold-400",
          ].join(" ")}
        >
          {introSent ? <CheckCircle2 className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
          {introSent ? "Intro sent" : "Send WhatsApp Intro"}
        </button>
      </div>

      <div className="p-5 space-y-6">
        {selectedSlotLabel && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-medium text-emerald-700">
            <CalendarClock className="w-4 h-4" /> Meeting scheduled for {selectedSlotLabel}
          </div>
        )}

        {/* Why Tenun recommends */}
        <div className="rounded-2xl border border-gold-200 bg-gold-50/70 p-4">
          <SectionTitle icon={<Sparkles className="w-4 h-4" />}>Why Tenun recommends this candidate</SectionTitle>
          <ul className="space-y-2">
            {candidate.whyHire.map((w) => (
              <li key={w} className="flex items-start gap-2 text-[13px] text-navy-700 leading-snug">
                <CheckCircle2 className="w-4 h-4 text-gold-600 mt-0.5 shrink-0" />
                {w}
              </li>
            ))}
          </ul>
        </div>

        {/* Project evidence */}
        <div ref={projectsRef} className="scroll-mt-24">
          <SectionTitle icon={<FolderGit2 className="w-4 h-4" />}>Project evidence</SectionTitle>
          <div className="space-y-3">
            {candidate.projects.map((p) => (
              <div key={p.name} className="rounded-2xl border border-beige-300/60 bg-beige-50 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-navy-900">{p.name}</p>
                  {p.link && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-navy-400">
                      <ExternalLink className="w-3 h-3" /> {p.link}
                    </span>
                  )}
                </div>
                <p className="text-xs text-navy-600 mt-1 leading-relaxed">{p.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {p.skills.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-full bg-white border border-beige-300 text-[11px] font-medium text-navy-600">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="flex items-start gap-1.5 text-[12px] text-emerald-700 mt-2 leading-snug">
                  <Target className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {p.outcome}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CV snapshot */}
        <div>
          <SectionTitle icon={<FileText className="w-4 h-4" />}>CV snapshot</SectionTitle>
          <p className="text-xs text-navy-600 leading-relaxed mb-3">{candidate.cvSummary}</p>

          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <GraduationCap className="w-4 h-4 text-navy-400 mt-0.5 shrink-0" />
              <div className="text-xs text-navy-700">
                {candidate.cv.education.map((ed) => (
                  <p key={ed.institution}>
                    <span className="font-semibold">{ed.qualification}</span> · {ed.institution} ({ed.period})
                    {ed.result ? ` · ${ed.result}` : ""}
                  </p>
                ))}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Briefcase className="w-4 h-4 text-navy-400 mt-0.5 shrink-0" />
              <ul className="text-xs text-navy-700 space-y-1">
                {candidate.cv.experience.slice(0, 3).map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Skill match & gaps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5">
            <SectionTitle icon={<CheckCircle2 className="w-4 h-4" />}>Skill match</SectionTitle>
            <div className="flex flex-wrap gap-1.5">
              {(matchedTerms.length ? matchedTerms : candidate.skills.slice(0, 5)).map((s) => (
                <span key={s} className="px-2 py-0.5 rounded-full bg-white border border-emerald-200 text-[11px] font-medium text-emerald-700">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3.5">
            <SectionTitle icon={<AlertTriangle className="w-4 h-4" />}>Visible gaps / things to probe</SectionTitle>
            <ul className="space-y-1.5">
              {candidate.possibleGaps.map((g) => (
                <li key={g} className="text-[12px] text-navy-700 leading-snug">• {g}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Interview focus */}
        <div>
          <SectionTitle icon={<Target className="w-4 h-4" />}>Suggested interview focus</SectionTitle>
          <ol className="space-y-1.5">
            {candidate.interviewFocus.map((q, i) => (
              <li key={q} className="flex items-start gap-2 text-[13px] text-navy-700 leading-snug">
                <span className="w-5 h-5 rounded-full bg-navy-100 text-navy-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                {q}
              </li>
            ))}
          </ol>
        </div>

        <p className="text-[11px] text-navy-400 pt-1">
          Prototype data · {candidate.industries.join(" · ")} · contact {candidate.email}
        </p>
      </div>
    </div>
  );
}
