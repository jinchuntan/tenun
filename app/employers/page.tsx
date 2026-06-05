"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MotionConfig } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { EmployerHero } from "@/components/employers/EmployerHero";
import { EmployerTickerSlim } from "@/components/employers/EmployerTickerSlim";
import { EmployerSteps } from "@/components/employers/EmployerSteps";
import { CandidateSignalSection } from "@/components/employers/CandidateSignalSection";
import { ComparisonSection } from "@/components/employers/ComparisonSection";
import { EmployerPortalPreview } from "@/components/employers/EmployerPortalPreview";
import { EmployerForm } from "@/components/employers/EmployerForm";
import { EmployerFAQ } from "@/components/employers/EmployerFAQ";

export default function EmployersPage() {
  const router = useRouter();
  const [roleTitle, setRoleTitle] = useState("");

  const scrollToId = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const goToDashboard = (fallbackRole: string) =>
    router.push(`/employers/dashboard?role=${encodeURIComponent(roleTitle.trim() || fallbackRole)}`);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-ivory overflow-x-clip">
        <Navbar />

        {/* Slim employer signal ticker directly below the fixed navbar */}
        <div className="pt-16">
          <EmployerTickerSlim />
        </div>

        <main>
          <EmployerHero
            roleTitle={roleTitle}
            setRoleTitle={setRoleTitle}
            onFindCandidates={() => goToDashboard("Software Engineer Intern")}
            onPostRole={() => scrollToId("employer-form")}
            onViewPreview={() => goToDashboard("Data Analyst Intern")}
          />
          <EmployerSteps />
          <CandidateSignalSection />
          <ComparisonSection />
          <EmployerPortalPreview />
          <EmployerForm roleTitle={roleTitle} />
          <EmployerFAQ />
        </main>

        <Footer />
      </div>
    </MotionConfig>
  );
}
