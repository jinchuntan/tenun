"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Globe,
  Send,
  Users,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export interface OnboardingStep {
  id: string;
  targetId: string;
  icon: React.ElementType;
  title: string;
  description: string;
}

const STEP_ICONS = [Layers, Sparkles, Map, Globe, GitBranch, BarChart3, Send, Users, BookOpen, Target, Briefcase, PartyPopper];
const STEP_TARGETS = ["", "summary", "threads", "atlas", "pathways", "charts", "outreach", "mentors", "courses", "skills", "opportunities", ""];

const STORAGE_KEY = "tenun-onboarding-completed";

export function OnboardingGuide({
  steps,
  storageKey = STORAGE_KEY,
  forceShow = false,
}: {
  steps?: OnboardingStep[];
  storageKey?: string;
  forceShow?: boolean;
}) {
  const { dict } = useLanguage();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const defaultSteps: OnboardingStep[] = dict.onboarding.steps.map((s, i) => ({
    id: STEP_TARGETS[i] || (i === 0 ? "welcome" : "finish"),
    targetId: STEP_TARGETS[i],
    icon: STEP_ICONS[i],
    title: s.title,
    description: s.description,
  }));

  const resolvedSteps = steps ?? defaultSteps;

  useEffect(() => {
    if (forceShow) {
      setCurrentStep(0);
      setIsActive(true);
      return;
    }
    try {
      const completed = localStorage.getItem(storageKey);
      if (!completed) {
        const timer = setTimeout(() => setIsActive(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage not available
    }
  }, [storageKey, forceShow]);

  // Scroll target into view and apply highlight ring
  const highlightTarget = useCallback(
    (stepIndex: number) => {
      // Remove any existing highlights
      document
        .querySelectorAll("[data-onboarding-highlight]")
        .forEach((el) => {
          el.removeAttribute("data-onboarding-highlight");
          (el as HTMLElement).style.removeProperty("box-shadow");
          (el as HTMLElement).style.removeProperty("border-radius");
          (el as HTMLElement).style.removeProperty("position");
          (el as HTMLElement).style.removeProperty("z-index");
        });

      const step = resolvedSteps[stepIndex];
      if (!step?.targetId) return;

      const el = document.getElementById(step.targetId);
      if (!el) return;

      // Apply a visible highlight ring on the section
      el.setAttribute("data-onboarding-highlight", "true");
      el.style.boxShadow = "0 0 0 3px rgba(212, 160, 23, 0.6), 0 0 24px 4px rgba(212, 160, 23, 0.15)";
      el.style.borderRadius = "16px";
      el.style.position = "relative";
      el.style.zIndex = "10";

      // Scroll into view with offset for sticky headers
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        const rect = el.getBoundingClientRect();
        const headerOffset = 160;
        // Only scroll if the element isn't already mostly visible
        if (rect.top < headerOffset || rect.top > window.innerHeight * 0.5) {
          const scrollTarget = window.scrollY + rect.top - headerOffset;
          window.scrollTo({ top: scrollTarget, behavior: "smooth" });
        }
      }, 50);
    },
    [resolvedSteps]
  );

  // Clean up highlights on unmount
  useEffect(() => {
    return () => {
      document
        .querySelectorAll("[data-onboarding-highlight]")
        .forEach((el) => {
          el.removeAttribute("data-onboarding-highlight");
          (el as HTMLElement).style.removeProperty("box-shadow");
          (el as HTMLElement).style.removeProperty("border-radius");
          (el as HTMLElement).style.removeProperty("position");
          (el as HTMLElement).style.removeProperty("z-index");
        });
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (isActive) highlightTarget(currentStep);
  }, [isActive, currentStep, highlightTarget]);

  const goToStep = (index: number) => setCurrentStep(index);

  const nextStep = () => {
    if (currentStep < resolvedSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const completeOnboarding = () => {
    setIsActive(false);
    setCurrentStep(0);
    // Clean up highlights
    document
      .querySelectorAll("[data-onboarding-highlight]")
      .forEach((el) => {
        el.removeAttribute("data-onboarding-highlight");
        (el as HTMLElement).style.removeProperty("box-shadow");
        (el as HTMLElement).style.removeProperty("border-radius");
        (el as HTMLElement).style.removeProperty("position");
        (el as HTMLElement).style.removeProperty("z-index");
      });
    try {
      localStorage.setItem(storageKey, "true");
    } catch {
      // localStorage not available
    }
  };

  if (!isActive) return null;

  const step = resolvedSteps[currentStep];
  const Icon = step.icon;
  const isCenter = !step.targetId;
  const isFirst = currentStep === 0;
  const isLast = currentStep === resolvedSteps.length - 1;
  const progress = ((currentStep + 1) / resolvedSteps.length) * 100;

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Semi-transparent backdrop — click to skip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-navy-950/40"
            onClick={completeOnboarding}
          />

          {/* Tour card — always fixed at center (welcome/finish) or bottom */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: isCenter ? 20 : 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={`fixed z-[101] px-4 ${
              isCenter
                ? "inset-0 flex items-center justify-center pointer-events-none"
                : "bottom-4 left-0 right-0 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-md"
            }`}
          >
            <div
              className={`bg-white rounded-2xl shadow-2xl border border-navy-100 overflow-hidden pointer-events-auto ${
                isCenter ? "w-full max-w-md" : "w-full"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Progress bar */}
              <div className="h-1.5 bg-navy-100">
                <motion.div
                  className="h-full bg-gradient-to-r from-navy-600 to-gold-500 rounded-full"
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>

              <div className="p-4 sm:p-5">
                {/* Header */}
                <div className="flex items-start gap-3 mb-2.5">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-navy-700 to-gold-500 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-navy-900 text-sm sm:text-base leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-[11px] text-navy-400 mt-0.5">
                      {dict.onboarding.stepXofY.replace("{x}", String(currentStep + 1)).replace("{y}", String(resolvedSteps.length))}
                    </p>
                  </div>
                  <button
                    onClick={completeOnboarding}
                    className="text-navy-300 hover:text-navy-600 transition-colors p-1 -m-1"
                    aria-label={dict.onboarding.closeGuide}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body */}
                <p className="text-xs sm:text-sm text-navy-600 leading-relaxed mb-4">
                  {step.description}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={completeOnboarding}
                    className="text-[11px] sm:text-xs text-navy-400 hover:text-navy-600 transition-colors whitespace-nowrap"
                  >
                    {dict.onboarding.skipTour}
                  </button>

                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {!isFirst && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={prevStep}
                        className="gap-1 h-8 px-2.5 text-xs"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span className="hidden sm:inline">{dict.onboarding.back}</span>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={nextStep}
                      className="gap-1 h-8 px-3 text-xs"
                    >
                      {isLast ? (
                        dict.onboarding.getStarted
                      ) : (
                        <>
                          {dict.onboarding.next}
                          <ArrowRight className="w-3 h-3" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Step dots */}
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  {resolvedSteps.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToStep(i)}
                      className={`rounded-full transition-all duration-300 ${
                        i === currentStep
                          ? "w-5 h-1.5 bg-navy-700"
                          : i < currentStep
                          ? "w-1.5 h-1.5 bg-gold-400"
                          : "w-1.5 h-1.5 bg-navy-200"
                      }`}
                      aria-label={dict.onboarding.goToStep.replace("{n}", String(i + 1))}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/** Small button to re-trigger the guide from the dashboard */
export function OnboardingTrigger({ onClick }: { onClick: () => void }) {
  const { dict } = useLanguage();
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-navy-500 hover:bg-navy-50 hover:text-navy-700 transition-all"
      title={dict.onboarding.restartGuide}
    >
      <Sparkles className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">{dict.onboarding.guideLabel}</span>
    </button>
  );
}
