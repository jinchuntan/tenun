"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Map,
  GitBranch,
  BarChart3,
  Target,
  Briefcase,
  ArrowLeft,
  Loader2,
  User,
  Sparkles,
  Download,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ThreadMap } from "@/components/dashboard/thread-map";
import { PathwayCards } from "@/components/dashboard/pathway-cards";
import { PathwayChart } from "@/components/dashboard/pathway-chart";
import { SkillGaps } from "@/components/dashboard/skill-gaps";
import { OpportunityMarketplace } from "@/components/dashboard/opportunity-marketplace";
import { OnboardingGuide, OnboardingTrigger } from "@/components/onboarding-guide";
import { GlobalCareerAtlas } from "@/components/dashboard/global-career-atlas";
import { generateCareerWeave } from "@/lib/career-engine";
import { personalizeAtlas } from "@/lib/atlas-engine";
import { careerHubs } from "@/lib/atlas-data";
import { demoProfile } from "@/lib/demo-data";
import { UserProfile, CareerWeaveResult, PersonalizedHub } from "@/lib/types";

const sections = [
  { id: "summary", icon: Sparkles, label: "Summary" },
  { id: "threads", icon: Map, label: "Thread Map" },
  { id: "pathways", icon: GitBranch, label: "Pathways" },
  { id: "charts", icon: BarChart3, label: "Charts" },
  { id: "atlas", icon: Globe, label: "Career Atlas" },
  { id: "skills", icon: Target, label: "Skill Gaps" },
  { id: "opportunities", icon: Briefcase, label: "Opportunities" },
];

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isDemo = searchParams.get("demo") === "true";

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [result, setResult] = useState<CareerWeaveResult | null>(null);
  const [atlasHubs, setAtlasHubs] = useState<PersonalizedHub[]>([]);
  const [activeSection, setActiveSection] = useState("summary");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingKey, setOnboardingKey] = useState(0);

  useEffect(() => {
    let p: UserProfile;

    if (isDemo) {
      p = demoProfile;
    } else {
      const stored = sessionStorage.getItem("tenun-profile");
      if (!stored) {
        router.push("/profile");
        return;
      }
      p = JSON.parse(stored);
    }

    setProfile(p);

    // Simulate processing
    const timer = setTimeout(() => {
      const weaveResult = generateCareerWeave(p);
      setResult(weaveResult);
      setAtlasHubs(personalizeAtlas(p, careerHubs));
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isDemo, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-beige-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="relative w-24 h-24 mx-auto mb-6">
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-navy-200"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border-4 border-t-gold-500 border-r-transparent border-b-transparent border-l-transparent"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Layers className="w-8 h-8 text-navy-700" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-navy-900 mb-2">
            Weaving your career threads...
          </h2>
          <p className="text-navy-500 text-sm">
            Analyzing your profile, generating pathways, and matching
            opportunities
          </p>
        </motion.div>
      </div>
    );
  }

  if (!result || !profile) return null;

  const avgScore = Math.round(
    result.threads.reduce((s, t) => s + t.score, 0) / result.threads.length
  );
  const topPathway = result.pathways.find(
    (p) => p.id === result.recommendedPathway
  );

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-beige-50">
      <Navbar />

      {/* Top bar */}
      <div className="pt-16 bg-white border-b border-navy-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(isDemo ? "/" : "/profile")}
                className="text-navy-400 hover:text-navy-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-navy-900">
                  {profile.name}&apos;s Career Weave
                </h1>
                <p className="text-xs text-navy-400">{profile.currentRole}</p>
              </div>
              {isDemo && (
                <span className="hidden sm:inline-flex items-center gap-1 bg-gold-50 text-gold-700 text-xs font-medium px-2.5 py-1 rounded-full border border-gold-200">
                  <Sparkles className="w-3 h-3" />
                  Demo Mode
                </span>
              )}
            </div>
            <OnboardingTrigger
              onClick={() => {
                setOnboardingKey((k) => k + 1);
                setShowOnboarding(true);
              }}
            />
          </div>

          {/* Section nav */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 -mx-1 px-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeSection === s.id
                    ? "bg-navy-700 text-white"
                    : "text-navy-500 hover:bg-navy-50 hover:text-navy-700"
                }`}
              >
                <s.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Summary */}
        <section id="summary">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-navy-800 to-navy-950 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
                <svg viewBox="0 0 200 200" fill="none">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <circle
                      key={i}
                      cx={100 + i * 15}
                      cy={100 - i * 10}
                      r={30 + i * 15}
                      stroke="white"
                      strokeWidth="1"
                      opacity={0.3}
                    />
                  ))}
                </svg>
              </div>
              <CardContent className="p-6 sm:p-8 relative">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-white/10 rounded-xl">
                    <div className="text-3xl font-bold text-gold-400">
                      {avgScore}
                    </div>
                    <div className="text-xs text-navy-300 mt-1">
                      Thread Strength
                    </div>
                  </div>
                  <div className="text-center p-4 bg-white/10 rounded-xl">
                    <div className="text-3xl font-bold text-gold-400">
                      {result.pathways.length}
                    </div>
                    <div className="text-xs text-navy-300 mt-1">
                      Career Pathways
                    </div>
                  </div>
                  <div className="text-center p-4 bg-white/10 rounded-xl">
                    <div className="text-3xl font-bold text-gold-400">
                      {result.opportunities.length}
                    </div>
                    <div className="text-xs text-navy-300 mt-1">
                      Matched Opportunities
                    </div>
                  </div>
                </div>
                <p className="text-sm text-navy-200 leading-relaxed">
                  {result.summary}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* Thread Map */}
        <section id="threads">
          <ThreadMap threads={result.threads} />
        </section>

        {/* Charts */}
        <section id="charts">
          <PathwayChart threads={result.threads} pathways={result.pathways} />
        </section>

        {/* Pathways */}
        <section id="pathways">
          <PathwayCards
            pathways={result.pathways}
            recommendedId={result.recommendedPathway}
          />
        </section>

        {/* Global Career Atlas */}
        <section id="atlas">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GlobalCareerAtlas hubs={atlasHubs} />
          </motion.div>
        </section>

        {/* Skill Gaps */}
        <section id="skills">
          <SkillGaps gaps={result.skillGaps} />
        </section>

        {/* Opportunities */}
        <section id="opportunities">
          <OpportunityMarketplace opportunities={result.opportunities} />
        </section>
      </div>

      <Footer />

      {/* Onboarding guide — shows automatically on first visit */}
      <OnboardingGuide
        key={onboardingKey}
        forceShow={showOnboarding}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-beige-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-navy-600" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
