"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Map,
  GitBranch,
  BarChart3,
  Target,
  Briefcase,
  Layers,
  PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface OnboardingStep {
  id: string;
  targetId: string;
  icon: React.ElementType;
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right" | "center";
}

const dashboardSteps: OnboardingStep[] = [
  {
    id: "welcome",
    targetId: "",
    icon: Layers,
    title: "Welcome to your Career Weave!",
    description:
      "This is your personalized career dashboard. We've analyzed your profile and generated insights across multiple dimensions. Let's walk through each section so you know exactly how to use it.",
    position: "center",
  },
  {
    id: "summary",
    targetId: "summary",
    icon: Sparkles,
    title: "Your Career Summary",
    description:
      "This overview shows your overall thread strength, the number of career pathways generated, and matched opportunities. The summary text provides a high-level analysis of your profile.",
    position: "bottom",
  },
  {
    id: "threads",
    targetId: "threads",
    icon: Map,
    title: "Career Thread Map",
    description:
      "Your profile is broken into 8 career threads — Skills, Experience, Education, Interests, Market Demand, Salary, Lifestyle, and Employer Fit. Each thread is scored 1-100 with explanations and improvement tips. The visualization shows how your threads connect.",
    position: "bottom",
  },
  {
    id: "charts",
    targetId: "charts",
    icon: BarChart3,
    title: "Visual Comparisons",
    description:
      "Switch between three chart views: the Thread Radar shows your strengths at a glance, Pathway Scores compares how well each career path fits you, and Dimension Compare breaks down pathways across salary, growth, stability, flexibility, and impact.",
    position: "bottom",
  },
  {
    id: "pathways",
    targetId: "pathways",
    icon: GitBranch,
    title: "Pathway Simulator",
    description:
      "Five distinct career directions tailored to you. Click any pathway to expand it and see suitable roles, required skills, trade-offs, risks, and your next 3 concrete actions. The one marked 'Best Match' has the highest alignment with your profile.",
    position: "top",
  },
  {
    id: "skills",
    targetId: "skills",
    icon: Target,
    title: "Skill Gap Plan",
    description:
      "These are skills you'll need to develop, prioritized by how many pathways require them. Each card shows your current vs. target level and recommends specific learning resources to close the gap.",
    position: "top",
  },
  {
    id: "opportunities",
    targetId: "opportunities",
    icon: Briefcase,
    title: "Opportunity Marketplace",
    description:
      "Jobs, internships, courses, projects, mentors, and portfolio challenges — all matched to your profile with a fit percentage. Use the filter tabs to browse by type, and click any card to see why it matches and what skills you'll develop.",
    position: "top",
  },
  {
    id: "finish",
    targetId: "",
    icon: PartyPopper,
    title: "You're all set!",
    description:
      "Explore each section at your own pace. Click the navigation tabs at the top to jump between sections. Remember — these pathways represent possibilities, not predictions. Your choices shape your journey.",
    position: "center",
  },
];

const STORAGE_KEY = "tenun-onboarding-completed";

export function OnboardingGuide({
  steps = dashboardSteps,
  storageKey = STORAGE_KEY,
  forceShow = false,
}: {
  steps?: OnboardingStep[];
  storageKey?: string;
  forceShow?: boolean;
}) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  // Check if onboarding has been completed before
  useEffect(() => {
    if (forceShow) {
      setIsActive(true);
      return;
    }
    try {
      const completed = localStorage.getItem(storageKey);
      if (!completed) {
        // Small delay to let dashboard render first
        const timer = setTimeout(() => setIsActive(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage not available
    }
  }, [storageKey, forceShow]);

  // Update highlight position when step changes
  const updateHighlight = useCallback(() => {
    const step = steps[currentStep];
    if (!step || !step.targetId || step.position === "center") {
      setHighlightRect(null);
      return;
    }
    const el = document.getElementById(step.targetId);
    if (el) {
      const rect = el.getBoundingClientRect();
      setHighlightRect(rect);
      // Scroll element into view with offset for sticky header
      const headerOffset = 140;
      const elementPosition = rect.top + window.scrollY;
      window.scrollTo({
        top: elementPosition - headerOffset,
        behavior: "smooth",
      });
    }
  }, [currentStep, steps]);

  useEffect(() => {
    if (!isActive) return;
    // Delay to allow scroll to finish
    const timer = setTimeout(updateHighlight, 400);
    window.addEventListener("resize", updateHighlight);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateHighlight);
    };
  }, [isActive, currentStep, updateHighlight]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = () => {
    setIsActive(false);
    try {
      localStorage.setItem(storageKey, "true");
    } catch {
      // localStorage not available
    }
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  if (!isActive) return null;

  const step = steps[currentStep];
  const Icon = step.icon;
  const isCenter = step.position === "center" || !highlightRect;
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Calculate tooltip position
  let tooltipStyle: React.CSSProperties = {};
  if (!isCenter && highlightRect) {
    const padding = 16;
    const tooltipWidth = Math.min(400, window.innerWidth - 32);

    if (step.position === "bottom") {
      tooltipStyle = {
        position: "fixed",
        top: highlightRect.bottom + padding,
        left: Math.max(
          16,
          Math.min(
            highlightRect.left + highlightRect.width / 2 - tooltipWidth / 2,
            window.innerWidth - tooltipWidth - 16
          )
        ),
        width: tooltipWidth,
      };
    } else if (step.position === "top") {
      tooltipStyle = {
        position: "fixed",
        bottom: window.innerHeight - highlightRect.top + padding,
        left: Math.max(
          16,
          Math.min(
            highlightRect.left + highlightRect.width / 2 - tooltipWidth / 2,
            window.innerWidth - tooltipWidth - 16
          )
        ),
        width: tooltipWidth,
      };
    }
  }

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100]"
            style={{ pointerEvents: "auto" }}
          >
            {/* Dark overlay with cutout for highlighted element */}
            <div className="absolute inset-0 bg-navy-950/60 transition-all duration-500">
              {highlightRect && !isCenter && (
                <div
                  className="absolute rounded-xl transition-all duration-500"
                  style={{
                    top: highlightRect.top - 8,
                    left: highlightRect.left - 8,
                    width: highlightRect.width + 16,
                    height: highlightRect.height + 16,
                    boxShadow: "0 0 0 9999px rgba(6, 10, 18, 0.6)",
                    border: "2px solid rgba(212, 160, 23, 0.5)",
                    background: "transparent",
                    pointerEvents: "none",
                  }}
                />
              )}
            </div>

            {/* Tooltip / Card */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={
                isCenter
                  ? "fixed inset-0 flex items-center justify-center px-4"
                  : ""
              }
              style={isCenter ? {} : tooltipStyle}
            >
              <div
                className={`bg-white rounded-2xl shadow-2xl border border-navy-100 overflow-hidden ${
                  isCenter ? "w-full max-w-md" : "w-full"
                }`}
              >
                {/* Progress bar */}
                <div className="h-1 bg-navy-100">
                  <motion.div
                    className="h-full bg-gradient-to-r from-navy-600 to-gold-500"
                    initial={{ width: `${((currentStep) / steps.length) * 100}%` }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>

                <div className="p-5 sm:p-6">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-700 to-gold-500 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-navy-900 text-base sm:text-lg leading-tight">
                        {step.title}
                      </h3>
                      <p className="text-[11px] text-navy-400 mt-0.5">
                        Step {currentStep + 1} of {steps.length}
                      </p>
                    </div>
                    <button
                      onClick={skipOnboarding}
                      className="text-navy-300 hover:text-navy-600 transition-colors p-1"
                      aria-label="Close guide"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Body */}
                  <p className="text-sm text-navy-600 leading-relaxed mb-5">
                    {step.description}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={skipOnboarding}
                      className="text-xs text-navy-400 hover:text-navy-600 transition-colors"
                    >
                      Skip tour
                    </button>

                    <div className="flex items-center gap-2">
                      {!isFirst && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={prevStep}
                          className="gap-1"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          Back
                        </Button>
                      )}
                      <Button size="sm" onClick={nextStep} className="gap-1">
                        {isLast ? (
                          "Get Started"
                        ) : (
                          <>
                            Next
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Step dots */}
                  <div className="flex items-center justify-center gap-1.5 mt-4">
                    {steps.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentStep(i)}
                        className={`rounded-full transition-all duration-300 ${
                          i === currentStep
                            ? "w-6 h-1.5 bg-navy-700"
                            : i < currentStep
                            ? "w-1.5 h-1.5 bg-gold-400"
                            : "w-1.5 h-1.5 bg-navy-200"
                        }`}
                        aria-label={`Go to step ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/** Small button to re-trigger the guide from the dashboard */
export function OnboardingTrigger({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-navy-500 hover:bg-navy-50 hover:text-navy-700 transition-all"
      title="Restart onboarding guide"
    >
      <Sparkles className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Guide</span>
    </button>
  );
}
