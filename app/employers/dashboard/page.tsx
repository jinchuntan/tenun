"use client";

import { Suspense, useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { SubNavBar } from "@/components/layout/SubNavBar";
import { getDashboardReturn } from "@/lib/navigation";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { Footer } from "@/components/footer";
import { EmployerTabBar, type EmployerTab } from "@/components/employers/dashboard/EmployerTabBar";
import { BestFitCandidatesPane } from "@/components/employers/dashboard/BestFitCandidatesPane";
import { JobPostingsPane } from "@/components/employers/dashboard/JobPostingsPane";
import { TopCandidatesPane } from "@/components/employers/dashboard/TopCandidatesPane";
import { CompanyProfilePane } from "@/components/employers/dashboard/CompanyProfilePane";
import { EmployerWorkspaceProvider } from "@/components/employers/dashboard/EmployerWorkspaceContext";
import { DEFAULT_ROLE } from "@/lib/employer-candidates";

const VALID_TABS: EmployerTab[] = ["postings", "candidates", "top", "profile"];

function DashboardInner() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { dict } = useLanguage();

  const initialRole = (searchParams.get("role") ?? DEFAULT_ROLE).trim() || DEFAULT_ROLE;
  const tabParam = searchParams.get("tab");
  const [tab, setTab] = useState<EmployerTab>(
    VALID_TABS.includes(tabParam as EmployerTab) ? (tabParam as EmployerTab) : "candidates"
  );

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <SubNavBar
          className="mb-6"
          breadcrumbs={[{ label: "Employers", href: "/employers" }, { label: "Workspace" }]}
          returnTo={getDashboardReturn(pathname, { labels: dict.navLabels })}
        />

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gold-600 uppercase tracking-wider mb-1.5">Employer workspace</p>
          <h1 className="font-display text-3xl sm:text-4xl text-navy-900 leading-tight">
            Your hiring workspace
          </h1>
        </div>

        <EmployerWorkspaceProvider>
          <EmployerTabBar active={tab} onSelect={setTab} />

          {tab === "candidates" && <BestFitCandidatesPane initialRole={initialRole} />}
          {tab === "postings" && <JobPostingsPane onViewCandidates={() => setTab("candidates")} />}
          {tab === "top" && <TopCandidatesPane />}
          {tab === "profile" && <CompanyProfilePane />}
        </EmployerWorkspaceProvider>
      </main>

      <Footer />
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
