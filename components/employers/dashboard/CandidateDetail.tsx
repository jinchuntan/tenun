"use client";

import { useRef, useState } from "react";
import {
  Sparkles, FileText, FolderGit2, Download, MapPin, Clock, Wallet,
  GraduationCap, Briefcase, Target, AlertTriangle, CheckCircle2, ExternalLink,
  TrendingUp, UserPlus, Hourglass, Check, X, ChevronDown, Award, Lightbulb,
  Users, Lock, Mail, Phone,
} from "lucide-react";
import {
  provenSkills, fitLabel, type CandidateSearchResult, type ConnectionStatus,
} from "@/lib/employer-candidates";

interface CandidateDetailProps {
  result: CandidateSearchResult;
  connection: ConnectionStatus;
  companyName: string;
  onConnect?: () => void;
  onViewCV: () => void;
  onDownloadCV: () => void;
  /** When embedded in an accordion row, hide the identity header + connect
   *  action (the row supplies those) and drop the outer card border. */
  embedded?: boolean;
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
  result, connection, companyName, onConnect, onViewCV, onDownloadCV, embedded = false,
}: CandidateDetailProps) {
  const { candidate, matchedSkills, meetsAllMustHaves } = result;
  const projectsRef = useRef<HTMLDivElement>(null);
  const [showMore, setShowMore] = useState(false);

  const proven = provenSkills(candidate);
  const fitSkills = Array.from(
    new Set([...matchedSkills.filter((s) => proven.includes(s)), ...proven])
  ).slice(0, 6);

  const company = companyName.trim() || "your company";
  const connected = connection === "accepted";

  return (
    <div className={embedded ? "" : "rounded-3xl border border-beige-300/60 bg-white overflow-hidden"}>
      {/* Header */}
      {!embedded && (
      <div className="p-5 bg-gradient-to-br from-navy-900 to-navy-800 text-white">
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 text-white text-lg font-bold flex items-center justify-center shrink-0">
            {candidate.initials}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold leading-tight">{candidate.name}</h3>
            <p className="text-xs text-navy-200 mt-0.5">{candidate.headline}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span
                className={[
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold",
                  meetsAllMustHaves
                    ? "bg-emerald-500/20 border border-emerald-300/30 text-emerald-100"
                    : "bg-gold-500/20 border border-gold-300/30 text-gold-100",
                ].join(" ")}
              >
                {meetsAllMustHaves ? <CheckCircle2 className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                {fitLabel(result)}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-semibold text-navy-100">
                {candidate.intentSignal}
              </span>
            </div>
          </div>
        </div>

        <p className="text-[13px] text-navy-100 leading-snug mt-3.5">{candidate.evidencedClaim}</p>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-[11px] text-navy-200">
          <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {candidate.location}</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {candidate.availability}</span>
          <span className="inline-flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5" /> {candidate.salaryExpectation}</span>
        </div>
      </div>
      )}

      {/* Action buttons */}
      <div className="p-4 border-b border-beige-200 space-y-2">
        {!embedded && onConnect && (
          <ConnectAction connection={connection} name={candidate.name} onConnect={onConnect} />
        )}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onViewCV}
            className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-navy-200 text-navy-800 text-xs font-semibold hover:border-navy-900 hover:bg-navy-50 transition-all"
          >
            <FileText className="w-4 h-4" /> View CV
          </button>
          <button
            onClick={onDownloadCV}
            className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-navy-200 text-navy-800 text-xs font-semibold hover:border-navy-900 hover:bg-navy-50 transition-all"
          >
            <Download className="w-4 h-4" /> Download CV
          </button>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Contact — gated behind an accepted connection */}
        <div
          className={[
            "rounded-2xl border p-4",
            connected ? "border-emerald-200 bg-emerald-50/60" : "border-beige-300/60 bg-beige-50",
          ].join(" ")}
        >
          {connected ? (
            <>
              <SectionTitle icon={<CheckCircle2 className="w-4 h-4" />}>Contact unlocked</SectionTitle>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-navy-700">
                <span className="inline-flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-navy-400" /> {candidate.email}</span>
                <span className="inline-flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-navy-400" /> {candidate.phone}</span>
              </div>
            </>
          ) : (
            <div className="flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-navy-400 mt-0.5 shrink-0" />
              <p className="text-xs text-navy-500 leading-relaxed">
                Contact details unlock once {candidate.name.split(" ")[0]} accepts your request to connect.
                Candidates always opt in — no cold outreach.
              </p>
            </div>
          )}
        </div>

        {/* 3-bullet summary */}
        <div>
          <SectionTitle icon={<Sparkles className="w-4 h-4" />}>In three lines</SectionTitle>
          <ul className="space-y-2">
            {candidate.summaryBullets.map((b) => (
              <li key={b} className="flex items-start gap-2 text-[13px] text-navy-700 leading-snug">
                <CheckCircle2 className="w-4 h-4 text-gold-600 mt-0.5 shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Growth / retention angle */}
        <div className="rounded-2xl border border-navy-200 bg-navy-50/60 p-4">
          <SectionTitle icon={<TrendingUp className="w-4 h-4" />}>How they&rsquo;d grow at {company}</SectionTitle>
          <p className="text-[13px] text-navy-700 leading-relaxed">{candidate.growthPath}</p>
        </div>

        {/* Best-fit skills (evidence-backed) */}
        <div>
          <SectionTitle icon={<CheckCircle2 className="w-4 h-4" />}>Evidence-backed skills</SectionTitle>
          <div className="flex flex-wrap gap-1.5">
            {fitSkills.map((s) => (
              <span key={s} className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-medium text-emerald-700">
                {s}
              </span>
            ))}
          </div>
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
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-navy-500 hover:text-navy-900"
                    >
                      <ExternalLink className="w-3 h-3" /> Open
                    </a>
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

        {/* Expandable: credentials, thinking proof, social proof, CV, gaps, interview */}
        <div className="rounded-2xl border border-beige-300/60 overflow-hidden">
          <button
            onClick={() => setShowMore((v) => !v)}
            aria-expanded={showMore}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-navy-900 hover:bg-beige-50 transition-colors"
          >
            More details
            <ChevronDown className={`w-4 h-4 text-navy-400 transition-transform ${showMore ? "rotate-180" : ""}`} />
          </button>

          {showMore && (
            <div className="px-4 pb-4 pt-1 space-y-5 border-t border-beige-200">
              <ProofList icon={<Award className="w-4 h-4" />} title="Credentials" items={candidate.credentials} />
              <ProofList icon={<Lightbulb className="w-4 h-4" />} title="Thinking proof" items={candidate.thinkingProof} />
              <ProofList icon={<Users className="w-4 h-4" />} title="Social proof" items={candidate.socialProof} />

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

              {/* Gaps to probe */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3.5">
                <SectionTitle icon={<AlertTriangle className="w-4 h-4" />}>Visible gaps / things to probe</SectionTitle>
                <ul className="space-y-1.5">
                  {candidate.possibleGaps.map((g) => (
                    <li key={g} className="text-[12px] text-navy-700 leading-snug">• {g}</li>
                  ))}
                </ul>
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
            </div>
          )}
        </div>

        <p className="text-[11px] text-navy-400 pt-1">
          Prototype data · fictional candidate · {candidate.industries.join(" · ")}
        </p>
      </div>
    </div>
  );
}

function ProofList({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div>
      <SectionTitle icon={icon}>{title}</SectionTitle>
      <ul className="space-y-1.5">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-2 text-[12px] text-navy-700 leading-snug">
            <span className="mt-1.5 w-1 h-1 rounded-full bg-navy-400 shrink-0" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ConnectAction({
  connection, name, onConnect,
}: { connection: ConnectionStatus; name: string; onConnect: () => void }) {
  const first = name.split(" ")[0];
  if (connection === "accepted") {
    return (
      <div className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold">
        <Check className="w-4 h-4" /> Connected with {first}
      </div>
    );
  }
  if (connection === "declined") {
    return (
      <div className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-navy-100 text-navy-500 text-sm font-semibold">
        <X className="w-4 h-4" /> {first} declined this request
      </div>
    );
  }
  if (connection === "pending") {
    return (
      <div className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gold-100 text-gold-700 text-sm font-bold">
        <Hourglass className="w-4 h-4" /> Request pending — waiting for {first}
      </div>
    );
  }
  return (
    <button
      onClick={onConnect}
      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gold-500 text-navy-900 text-sm font-bold hover:bg-gold-400 transition-all"
    >
      <UserPlus className="w-4 h-4" /> Request to connect
    </button>
  );
}
