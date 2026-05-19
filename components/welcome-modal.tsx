"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowRight,
  Layers,
  Map,
  GitBranch,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const WELCOME_KEY = "tenun-welcome-shown";

const highlights = [
  {
    icon: Layers,
    title: "Build your profile",
    description: "Enter your skills, experience, interests, and career preferences.",
  },
  {
    icon: Map,
    title: "See your career threads",
    description: "Your profile is analyzed across 8 dimensions — each scored and explained.",
  },
  {
    icon: GitBranch,
    title: "Compare pathways",
    description: "Explore 5 realistic career paths with timelines, trade-offs, and next steps.",
  },
  {
    icon: Briefcase,
    title: "Match with opportunities",
    description: "Discover jobs, courses, mentors, and projects matched to your profile.",
  },
];

export function WelcomeModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const shown = localStorage.getItem(WELCOME_KEY);
      if (!shown) {
        const timer = setTimeout(() => setShow(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(WELCOME_KEY, "true");
    } catch {
      // localStorage not available
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center px-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm"
            onClick={dismiss}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            {/* Decorative header */}
            <div className="bg-gradient-to-br from-navy-800 to-navy-950 p-6 sm:p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <svg viewBox="0 0 400 150" fill="none" className="w-full h-full">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.path
                      key={i}
                      d={`M 0 ${25 + i * 25} Q 100 ${10 + i * 20 + (i % 2) * 30} 200 ${30 + i * 22} T 400 ${20 + i * 24}`}
                      stroke={
                        ["#4164b4", "#d4a017", "#6c5ce7", "#e17055", "#2d8a4e"][i]
                      }
                      strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, delay: i * 0.2 }}
                    />
                  ))}
                </svg>
              </div>
              <button
                onClick={dismiss}
                className="absolute top-3 right-3 text-navy-400 hover:text-white transition-colors p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-navy-500 to-gold-500 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Welcome to Tenun
                </h2>
                <p className="text-navy-300 text-sm">
                  The Career Weaving OS — here&apos;s how it works
                </p>
              </div>
            </div>

            {/* Steps */}
            <div className="p-5 sm:p-6 space-y-4">
              {highlights.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-navy-50 flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon className="w-4.5 h-4.5 text-navy-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-900 text-sm">
                      <span className="text-gold-500 mr-1.5">{i + 1}.</span>
                      {item.title}
                    </h3>
                    <p className="text-xs text-navy-500 leading-relaxed mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            <div className="px-5 sm:px-6 pb-5 sm:pb-6 flex flex-col sm:flex-row gap-3">
              <Link href="/profile" className="flex-1" onClick={dismiss}>
                <Button size="lg" className="w-full group">
                  Start Career Weave
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/dashboard?demo=true" className="flex-1" onClick={dismiss}>
                <Button size="lg" variant="outline" className="w-full">
                  Try Demo First
                </Button>
              </Link>
            </div>

            <div className="px-5 sm:px-6 pb-4 text-center">
              <button
                onClick={dismiss}
                className="text-xs text-navy-400 hover:text-navy-600 transition-colors"
              >
                I&apos;ll explore on my own
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
