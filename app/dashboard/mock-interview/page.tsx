"use client";

import { Mic } from "lucide-react";

import { AuthGate } from "@/components/auth-gate";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { MockInterviewSession } from "@/components/interview/MockInterviewSession";

export default function MockInterviewPage() {
  return (
    <AuthGate
      next="/dashboard/mock-interview"
      title="Sign in to practise with the AI Mock Interview"
      subtitle="Create your free account to run a real AI interview with instant feedback."
      perks={[
        "Practise real interview questions tailored to your target role",
        "Answer by typing or with your voice, then get a score and tips",
        "Finish with a personalised report on strengths and what to improve",
      ]}
    >
      <div className="min-h-screen bg-[#f5f0e8]">
        <AppTopBar
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "AI Mock Interview" },
          ]}
          returnTo={{ href: "/dashboard", label: "Exit to Dashboard" }}
        />

        <div className="px-4 py-8 sm:py-10">
          {/* Intro */}
          <div className="max-w-2xl mx-auto mb-7 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#d4a017]/15 mb-3">
              <Mic size={22} className="text-[#d4a017]" aria-hidden="true" />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl text-navy-900">AI Mock Interview</h1>
            <p className="text-sm text-navy-500 mt-2 max-w-md mx-auto leading-relaxed">
              Practise interview questions with text or voice and get instant, practical feedback —
              then finish with a report you can act on.
            </p>
          </div>

          <MockInterviewSession />
        </div>
      </div>
    </AuthGate>
  );
}
