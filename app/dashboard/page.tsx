"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Layers } from "lucide-react";
import { motion } from "framer-motion";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import { AuthGate } from "@/components/auth-gate";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ProfilePane } from "@/components/dashboard/panes/ProfilePane";
import { PathsPane } from "@/components/dashboard/panes/PathsPane";
import { SkillsPane } from "@/components/dashboard/panes/SkillsPane";
import { OpportunitiesPane } from "@/components/dashboard/panes/OpportunitiesPane";
import { CVPane } from "@/components/dashboard/panes/CVPane";
import { MockInterviewEntryCard } from "@/components/interview/MockInterviewEntryCard";
import { GlobalCareerAtlas } from "@/components/dashboard/global-career-atlas";
import { MentorConnect } from "@/components/dashboard/mentor-connect";
import { OutreachStudio } from "@/components/dashboard/outreach-studio";

import { useAppDispatch } from "@/store/hooks";
import { setActivePathwayId } from "@/store/slices/dashboardSlice";

import { generateCareerWeave } from "@/lib/career-engine";
import { personalizeAtlas } from "@/lib/atlas-engine";
import { personalizeMentors } from "@/lib/mentor-engine";
import { personalizeCourses } from "@/lib/course-engine";
import { careerHubs } from "@/lib/atlas-data";
import { demoProfile } from "@/lib/demo-data";
import type {
  UserProfile, CareerWeaveResult,
  PersonalizedHub, PersonalizedMentor, PersonalizedCourseRecommendation,
} from "@/lib/types";

// ---------- Loading screen ----------

function LoadingScreen() {
  const { dict } = useLanguage();
  return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-5">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#d4a017]/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-1 rounded-full border-2 border-t-[#d4a017] border-r-transparent border-b-transparent border-l-transparent"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Layers size={20} className="text-[#0a1628]" />
          </div>
        </div>
        <p className="text-sm font-medium text-[#0a1628]">{dict.dashboardPage.loading}</p>
        <p className="text-xs text-gray-400 mt-1">{dict.dashboardPage.loadingSubtitle}</p>
      </motion.div>
    </div>
  );
}

// ---------- Section wrapper ----------

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section
      id={`section-${id}`}
      className="min-h-[50vh] border-b border-gray-200/60 last:border-b-0"
    >
      {children}
    </section>
  );
}

// ---------- Dashboard content ----------

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isDemo = searchParams.get("demo") === "true";

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [result, setResult] = useState<CareerWeaveResult | null>(null);
  const [atlasHubs, setAtlasHubs] = useState<PersonalizedHub[]>([]);
  const [mentors, setMentors] = useState<PersonalizedMentor[]>([]);
  const [courses, setCourses] = useState<PersonalizedCourseRecommendation[]>([]);

  useEffect(() => {
    let p: UserProfile;
    if (isDemo) {
      p = demoProfile;
    } else {
      const stored = sessionStorage.getItem("tenun-profile");
      if (!stored) { router.push("/profile"); return; }
      p = JSON.parse(stored);
    }

    setProfile(p);
    const storedTarget = sessionStorage.getItem("tenun-target-job") || undefined;

    const timer = setTimeout(() => {
      const weaveResult = generateCareerWeave(p, storedTarget);
      setResult(weaveResult);
      setAtlasHubs(personalizeAtlas(p, careerHubs));
      setMentors(personalizeMentors(p, weaveResult.pathways));
      setCourses(personalizeCourses(p, weaveResult.skillGaps, weaveResult.pathways, weaveResult.recommendedPathway));
      dispatch(setActivePathwayId(weaveResult.recommendedPathway));
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [isDemo, router, dispatch]);

  if (loading) return <LoadingScreen />;
  if (!result || !profile) return null;

  return (
    <DashboardShell
      userName={profile.name}
      currentRole={profile.currentRole}
      targetJob={result.targetJob}
    >
      <Section id="profile">
        <ProfilePane archetype={result.archetype} threads={result.threads} />
      </Section>

      <Section id="paths">
        <PathsPane
          pathways={result.pathways}
          recommendedPathwayId={result.recommendedPathway}
        />
      </Section>

      <Section id="skills">
        <SkillsPane
          skillGaps={result.skillGaps}
          pathways={result.pathways}
          recommendedPathwayId={result.recommendedPathway}
        />
      </Section>

      <Section id="opportunities">
        <OpportunitiesPane
          opportunities={result.opportunities}
          pathways={result.pathways}
          recommendedPathwayId={result.recommendedPathway}
        />
      </Section>

      <Section id="atlas">
        <div className="p-4 sm:p-6">
          <GlobalCareerAtlas hubs={atlasHubs} />
        </div>
      </Section>

      <Section id="mentors">
        <div className="p-4 sm:p-6">
          <MentorConnect profile={profile} archetype={result.archetype} />
        </div>
      </Section>

      <Section id="outreach">
        <div className="p-4 sm:p-6">
          <OutreachStudio
            profile={profile}
            pathways={result.pathways}
            mentors={mentors}
            hubs={atlasHubs}
            skillGaps={result.skillGaps}
          />
        </div>
      </Section>

      <Section id="cv">
        <CVPane />
      </Section>

      <Section id="mock-interview">
        <MockInterviewEntryCard />
      </Section>
    </DashboardShell>
  );
}

// ---------- Page ----------

export default function DashboardPage() {
  const { dict } = useLanguage();
  return (
    <AuthGate
      next="/dashboard"
      title={dict.dashboardPage.authTitle}
      subtitle={dict.dashboardPage.authSubtitle}
      perks={dict.dashboardPage.authPerks}
    >
      <Suspense fallback={
        <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-[#0a1628]" />
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </AuthGate>
  );
}
