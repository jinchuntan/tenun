"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { Search, Users, Star, FolderCheck, CalendarCheck, Loader2 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { SubNavBar } from "@/components/layout/SubNavBar";
import { getDashboardReturn } from "@/lib/navigation";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { Footer } from "@/components/footer";
import { CandidateCard } from "@/components/employers/dashboard/CandidateCard";
import { CandidateDetail } from "@/components/employers/dashboard/CandidateDetail";
import { CandidateCVModal } from "@/components/employers/dashboard/CandidateCVModal";
import { MeetingModal } from "@/components/employers/dashboard/MeetingModal";
import { MessageModal } from "@/components/employers/dashboard/MessageModal";
import { rankCandidates, DEFAULT_ROLE } from "@/lib/employer-candidates";

const SUGGESTED_CHIPS = [
  "Backend SWE — Node.js Python Go",
  "Data Analyst Intern",
  "Product/UX Associate",
  "Cybersecurity Analyst",
  "Finance Graduate Analyst",
];

type ModalKind = "cv" | "meeting" | "message" | null;

function StatCard({
  icon, value, label, accent,
}: { icon: React.ReactNode; value: number; label: string; accent: string }) {
  return (
    <div className="rounded-2xl border border-beige-300/60 bg-white p-4">
      <span className={`flex items-center justify-center w-8 h-8 rounded-lg mb-3 ${accent}`}>{icon}</span>
      <div className="font-display text-2xl text-navy-900 leading-none mb-1">{value}</div>
      <p className="text-[11px] text-navy-500 leading-snug">{label}</p>
    </div>
  );
}

function DashboardInner() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { dict } = useLanguage();
  const initialRole = (searchParams.get("role") ?? DEFAULT_ROLE).trim() || DEFAULT_ROLE;

  const [query, setQuery] = useState(initialRole);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalKind>(null);
  const [meetingByCandidate, setMeetingByCandidate] =
    useState<Record<string, { id: string; label: string }>>({});
  const [sentByCandidate, setSentByCandidate] = useState<Record<string, boolean>>({});

  const detailRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => rankCandidates(query), [query]);

  // Selected result derives from state, falling back to the top match.
  const selectedResult = results.find((r) => r.candidate.id === selectedId) ?? results[0];
  const candidate = selectedResult.candidate;

  const selectedSlot = meetingByCandidate[candidate.id] ?? null;
  const introSent = !!sentByCandidate[candidate.id];

  // Stats (recomputed per query so they feel responsive)
  const stats = {
    matched: results.length,
    strong: results.filter((r) => r.score >= 85).length,
    portfolioReady: results.filter((r) => r.candidate.projects.length >= 2).length,
    meetingReady: results.filter((r) => r.candidate.intentSignal === "Actively looking").length,
  };

  function runSearch(next: string) {
    setQuery(next);
    setSelectedId(null); // jump back to the top match for a fresh search
  }

  function selectCandidate(id: string) {
    setSelectedId(id);
    // On narrow screens, bring the detail panel into view.
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <SubNavBar
          className="mb-6"
          breadcrumbs={[{ label: "Employers", href: "/employers" }, { label: "Candidate Dashboard" }]}
          returnTo={getDashboardReturn(pathname, { labels: dict.navLabels })}
        />

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gold-600 uppercase tracking-wider mb-1.5">Employer workspace</p>
          <h1 className="font-display text-3xl sm:text-4xl text-navy-900 leading-tight">
            Employer Candidate Dashboard
          </h1>
          <p className="text-sm text-navy-500 mt-1.5 max-w-2xl">
            Tenun ranks your candidate pool by role intent, skills and real project evidence —
            so you see <span className="font-semibold text-navy-700">why</span> each person fits, not just a stack of CVs.
          </p>
        </div>

        {/* Search */}
        <form
          onSubmit={(e) => { e.preventDefault(); }}
          className="relative max-w-2xl"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Backend developer with Node.js, Python, Go"
            aria-label="Search candidates by role or skills"
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-beige-300 bg-white text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-4 focus:ring-gold-500/15 focus:border-gold-400 transition-all shadow-sm"
          />
        </form>

        {/* Suggested chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {SUGGESTED_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => runSearch(chip)}
              className="px-3 py-1.5 rounded-full border border-beige-300 bg-white text-xs font-medium text-navy-600 hover:border-gold-300 hover:text-navy-900 transition-all"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          <StatCard icon={<Users className="w-4 h-4" />} value={stats.matched} label="Matched candidates" accent="text-navy-700 bg-navy-50" />
          <StatCard icon={<Star className="w-4 h-4" />} value={stats.strong} label="Strong matches (85%+)" accent="text-gold-700 bg-gold-50" />
          <StatCard icon={<FolderCheck className="w-4 h-4" />} value={stats.portfolioReady} label="Portfolio-ready" accent="text-emerald-700 bg-emerald-50" />
          <StatCard icon={<CalendarCheck className="w-4 h-4" />} value={stats.meetingReady} label="Meeting-ready" accent="text-navy-500 bg-beige-200" />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-5 mt-6">
          {/* Shortlist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-navy-900">
                Ranked shortlist for &ldquo;{query.trim() || DEFAULT_ROLE}&rdquo;
              </h2>
              <span className="text-xs text-navy-400">{results.length} candidates</span>
            </div>
            <div className="space-y-3">
              {results.map((result, i) => (
                <CandidateCard
                  key={result.candidate.id}
                  result={result}
                  rank={i + 1}
                  selected={result.candidate.id === candidate.id}
                  onSelect={() => selectCandidate(result.candidate.id)}
                />
              ))}
            </div>
          </div>

          {/* Detail */}
          <div ref={detailRef} className="lg:sticky lg:top-20 lg:self-start scroll-mt-20">
            <CandidateDetail
              result={selectedResult}
              selectedSlotLabel={selectedSlot?.label ?? null}
              introSent={introSent}
              onViewCV={() => setModal("cv")}
              onBookMeeting={() => setModal("meeting")}
              onSendIntro={() => setModal("message")}
            />
          </div>
        </div>
      </main>

      <Footer />

      {/* Modals */}
      {modal === "cv" && (
        <CandidateCVModal candidate={candidate} onClose={() => setModal(null)} />
      )}
      {modal === "meeting" && (
        <MeetingModal
          candidate={candidate}
          selectedSlotId={selectedSlot?.id ?? null}
          onSelectSlot={(id, label) =>
            setMeetingByCandidate((prev) => ({ ...prev, [candidate.id]: { id, label } }))
          }
          onClose={() => setModal(null)}
        />
      )}
      {modal === "message" && (
        <MessageModal
          candidate={candidate}
          role={query}
          selectedSlotLabel={selectedSlot?.label ?? null}
          sent={introSent}
          onMarkSent={() => setSentByCandidate((prev) => ({ ...prev, [candidate.id]: true }))}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

export default function EmployerDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ivory flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-navy-700" />
        </div>
      }
    >
      <DashboardInner />
    </Suspense>
  );
}
