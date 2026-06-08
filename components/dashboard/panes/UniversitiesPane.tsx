"use client";

import { useState } from "react";
import {
  GraduationCap, BadgeCheck, Building2, CalendarDays, MapPin, ArrowRight,
  Bookmark, BookmarkCheck, Sparkles, Users, FileText, Mic, Briefcase,
  BookOpen, Layers, Lock,
} from "lucide-react";

import { useAppDispatch } from "@/store/hooks";
import { setActiveSection, type DashboardSection } from "@/store/slices/dashboardSlice";
import type { UserProfile, CareerWeaveResult } from "@/lib/types";
import {
  inferUniversityProfile,
  computeReadiness,
  buildSkillsBridge,
  UNIVERSITY_OPPORTUNITIES,
  ALUMNI_MENTORS,
  UNIVERSITY_PARTNER_BENEFITS,
  type UniversityOpportunity,
  type AlumniMentor,
} from "@/lib/university-data";

interface Props {
  profile: UserProfile;
  result: CareerWeaveResult;
}

export function UniversitiesPane({ profile, result }: Props) {
  const dispatch = useAppDispatch();
  const go = (section: DashboardSection) => dispatch(setActiveSection(section));

  const uni = inferUniversityProfile(profile);
  const readiness = computeReadiness(profile, result);
  const bridge = buildSkillsBridge(uni, result);
  const recommended = result.pathways.find((p) => p.id === result.recommendedPathway);
  const targetLabel = result.targetJob || recommended?.name || "your target roles";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#0a1628]">University Career Bridge</h2>
        <p className="text-xs text-[#0a1628]/50 mt-0.5">
          How your university connects to your career readiness, internships, and alumni network.
        </p>
      </div>

      <UniversityProfileCard uni={uni} />
      <CareerReadinessSnapshot readiness={readiness} />
      <UniversityOpportunities targetLabel={targetLabel} onPrepare={() => go("cv")} />
      <AlumniMentorNetwork
        onRequestAdvice={() => go("mentors")}
        onBookInterview={() => go("mock-interview")}
      />
      <UniversitySkillsBridge bridge={bridge} targetLabel={targetLabel} onAction={go} />
      <UniversityFutureTeaser />
    </div>
  );
}

/* ── 1. University Profile Card ─────────────────────────────────────────── */

function UniversityProfileCard({
  uni,
}: {
  uni: ReturnType<typeof inferUniversityProfile>;
}) {
  return (
    <div className="rounded-2xl bg-[#0a1628] text-white p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#d4a017] text-[#0a1628] flex items-center justify-center">
          <GraduationCap size={26} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold truncate">{uni.name}</h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#d4a017]/20 text-[#d4a017]">
              <BadgeCheck size={11} /> {uni.verification}
            </span>
          </div>
          <p className="text-sm text-white/70 mt-0.5">{uni.faculty}</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 mt-4">
            <Field label="Programme" value={uni.programme} />
            <Field label="Graduation" value={uni.graduationYear} />
            <Field label="Career centre" value={uni.careerCentre} />
          </div>

          {!uni.inferred && (
            <p className="text-[11px] text-white/40 mt-3">
              Showing sample university data. Link your student email to verify your real profile.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wider text-white/40">{label}</p>
      <p className="text-xs sm:text-sm text-white/90 font-medium leading-snug">{value}</p>
    </div>
  );
}

/* ── 2. Career Readiness Snapshot ──────────────────────────────────────── */

function CareerReadinessSnapshot({
  readiness,
}: {
  readiness: ReturnType<typeof computeReadiness>;
}) {
  return (
    <section>
      <SectionTitle icon={<Sparkles size={15} />} title="Career readiness snapshot" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-3">
        {readiness.map((m) => {
          const tone =
            m.value >= 70 ? "#2d8a4e" : m.value >= 45 ? "#d4a017" : "#c44569";
          return (
            <div key={m.key} className="rounded-2xl bg-white border border-gray-200 p-3.5 flex flex-col">
              <div className="flex items-baseline justify-between gap-1">
                <p className="text-xs font-semibold text-[#0a1628] leading-tight">{m.label}</p>
                <span className="text-sm font-bold tabular-nums" style={{ color: tone }}>
                  {m.value}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mt-2">
                <div className="h-full rounded-full" style={{ width: `${m.value}%`, backgroundColor: tone }} />
              </div>
              <p className="text-[10px] text-gray-400 mt-2 leading-snug">{m.hint}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ── 3. University-Supported Opportunities ─────────────────────────────── */

const OPP_TYPE_TONE: Record<string, string> = {
  Internship: "bg-blue-50 text-blue-700 border-blue-100",
  "Graduate Programme": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "Career Fair": "bg-amber-50 text-amber-700 border-amber-100",
  "Campus Event": "bg-violet-50 text-violet-700 border-violet-100",
  Scholarship: "bg-rose-50 text-rose-700 border-rose-100",
  Hackathon: "bg-cyan-50 text-cyan-700 border-cyan-100",
};

function UniversityOpportunities({
  targetLabel,
  onPrepare,
}: {
  targetLabel: string;
  onPrepare: () => void;
}) {
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <section>
      <SectionTitle
        icon={<Briefcase size={15} />}
        title="University-supported opportunities"
        subtitle={`Campus-linked openings relevant to ${targetLabel}.`}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
        {UNIVERSITY_OPPORTUNITIES.map((o) => (
          <OpportunityRow
            key={o.id}
            opp={o}
            saved={saved.has(o.id)}
            onToggleSave={() => toggle(o.id)}
            onPrepare={onPrepare}
          />
        ))}
      </div>
    </section>
  );
}

function OpportunityRow({
  opp: o,
  saved,
  onToggleSave,
  onPrepare,
}: {
  opp: UniversityOpportunity;
  saved: boolean;
  onToggleSave: () => void;
  onPrepare: () => void;
}) {
  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-4 flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <span
          className={[
            "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
            OPP_TYPE_TONE[o.type] ?? "bg-gray-50 text-gray-600 border-gray-100",
          ].join(" ")}
        >
          {o.type}
        </span>
        <button
          type="button"
          onClick={onToggleSave}
          aria-label={saved ? "Remove from saved" : "Save opportunity"}
          aria-pressed={saved}
          className="shrink-0 text-[#0a1628]/40 hover:text-[#d4a017] transition-colors"
        >
          {saved ? <BookmarkCheck size={16} className="text-[#d4a017]" /> : <Bookmark size={16} />}
        </button>
      </div>

      <h4 className="text-sm font-semibold text-[#0a1628] mt-2">{o.title}</h4>
      <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
        <Building2 size={12} className="shrink-0" /> {o.organization}
      </p>
      <p className="text-xs text-gray-600 mt-2 leading-relaxed">{o.relevance}</p>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-[11px] text-gray-400">
        <span className="flex items-center gap-1"><CalendarDays size={11} /> {o.date}</span>
        <span className="flex items-center gap-1"><MapPin size={11} /> {o.location}</span>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={onPrepare}
          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#0a1628] text-white hover:bg-[#1a2a4a] transition-colors"
        >
          Prepare <ArrowRight size={12} />
        </button>
        <button
          type="button"
          onClick={onToggleSave}
          className="text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200 text-[#0a1628] hover:border-[#0a1628]/40 transition-colors"
        >
          {saved ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}

/* ── 4. Alumni & Mentor Network ────────────────────────────────────────── */

const STATUS_TONE: Record<AlumniMentor["status"], string> = {
  Available: "bg-emerald-50 text-emerald-700",
  Limited: "bg-amber-50 text-amber-700",
  Busy: "bg-gray-100 text-gray-500",
};

function AlumniMentorNetwork({
  onRequestAdvice,
  onBookInterview,
}: {
  onRequestAdvice: () => void;
  onBookInterview: () => void;
}) {
  return (
    <section>
      <SectionTitle
        icon={<Users size={15} />}
        title="Alumni & mentor network"
        subtitle="Graduates from your university who can guide your next step."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
        {ALUMNI_MENTORS.map((m) => (
          <div key={m.id} className="rounded-2xl bg-white border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-10 h-10 rounded-full bg-[#0a1628]/5 flex items-center justify-center text-sm font-bold text-[#0a1628]">
                {m.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[#0a1628] truncate">{m.name}</p>
                  <span className={["text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0", STATUS_TONE[m.status]].join(" ")}>
                    {m.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{m.role} · {m.company}</p>
                <p className="text-[11px] text-[#d4a017] font-medium mt-0.5">{m.university}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {m.expertise.map((e) => (
                <span key={e} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 border border-gray-100">
                  {e}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={onRequestAdvice}
                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#0a1628] text-white hover:bg-[#1a2a4a] transition-colors"
              >
                <Users size={12} /> Request advice
              </button>
              <button
                type="button"
                onClick={onBookInterview}
                className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200 text-[#0a1628] hover:border-[#0a1628]/40 transition-colors"
              >
                <Mic size={12} /> Mock interview
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── 5. Skills Gap from University to Market ───────────────────────────── */

const BRIDGE_ACTIONS: { label: string; icon: React.ReactNode; section: DashboardSection }[] = [
  { label: "Improve CV", icon: <FileText size={13} />, section: "cv" },
  { label: "Practise mock interview", icon: <Mic size={13} />, section: "mock-interview" },
  { label: "Add portfolio project", icon: <Layers size={13} />, section: "cv" },
  { label: "Apply to internship", icon: <Briefcase size={13} />, section: "opportunities" },
  { label: "Take a short course", icon: <BookOpen size={13} />, section: "skills" },
];

function UniversitySkillsBridge({
  bridge,
  targetLabel,
  onAction,
}: {
  bridge: ReturnType<typeof buildSkillsBridge>;
  targetLabel: string;
  onAction: (section: DashboardSection) => void;
}) {
  return (
    <section>
      <SectionTitle
        icon={<ArrowRight size={15} />}
        title="From university to market"
        subtitle={`Bridging what you studied with what ${targetLabel} needs.`}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
        <BridgeColumn title="What you studied" tone="#4164b4" items={bridge.studied} />
        <BridgeColumn title="What the role needs" tone="#2d8a4e" items={bridge.required} />
        <BridgeColumn title="Gaps to close" tone="#c44569" items={bridge.gaps} emptyText="No major gaps — nice work." />
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 p-4 mt-3">
        <p className="text-xs font-bold uppercase tracking-wider text-[#0a1628]/60 mb-3">
          Recommended actions
        </p>
        <div className="flex flex-wrap gap-2">
          {BRIDGE_ACTIONS.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => onAction(a.section)}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-[#f3f1ec] text-[#0a1628] hover:bg-[#e7e4dd] transition-colors"
            >
              {a.icon} {a.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function BridgeColumn({
  title,
  tone,
  items,
  emptyText,
}: {
  title: string;
  tone: string;
  items: string[];
  emptyText?: string;
}) {
  return (
    <div className="rounded-2xl bg-white border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tone }} />
        <p className="text-xs font-bold text-[#0a1628]">{title}</p>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-gray-400 italic">{emptyText ?? "—"}</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((it) => (
            <li key={it} className="flex gap-2 text-xs text-[#1a1a1a]">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: tone }} />
              <span className="leading-snug">{it}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── 6. Future University Dashboard Teaser ─────────────────────────────── */

function UniversityFutureTeaser() {
  return (
    <section className="rounded-2xl border border-dashed border-[#0a1628]/20 bg-[#f7f5f0] p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0a1628]/5 text-[#0a1628]">
          <Building2 size={16} />
        </span>
        <h3 className="text-sm font-bold text-[#0a1628]">For Universities</h3>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#d4a017]/15 text-[#8a6d1f]">
          <Lock size={10} /> Partner preview
        </span>
      </div>
      <p className="text-xs text-[#0a1628]/60 mt-2 max-w-2xl">
        University partners will be able to use Tenun&apos;s Career OS to support students at scale:
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 mt-3">
        {UNIVERSITY_PARTNER_BENEFITS.map((b) => (
          <li key={b} className="flex gap-2 text-xs text-[#0a1628]/75">
            <BadgeCheck size={13} className="text-[#d4a017] shrink-0 mt-0.5" />
            <span className="leading-snug">{b}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ── shared ─────────────────────────────────────────────────────────────── */

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-bold text-[#0a1628]">
        <span className="text-[#d4a017]">{icon}</span>
        {title}
      </h3>
      {subtitle && <p className="text-xs text-[#0a1628]/50 mt-0.5">{subtitle}</p>}
    </div>
  );
}
