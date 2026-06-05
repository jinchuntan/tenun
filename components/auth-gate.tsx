"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useAuth } from "@/lib/use-auth";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface AuthGateProps {
  /** Where to return after sign-in (the page being protected) */
  next: string;
  /** Headline shown on the gate */
  title?: string;
  /** Supporting line */
  subtitle?: string;
  /** What the user unlocks — 3 short reassuring points */
  perks?: string[];
  children: React.ReactNode;
}

/**
 * Wraps a protected page. If the user is signed in (or Supabase is disabled
 * for local dev), it renders children. Otherwise it shows a warm sign-in screen.
 */
export function AuthGate({
  next,
  title,
  subtitle,
  perks,
  children,
}: AuthGateProps) {
  const { user, loading, authDisabled } = useAuth();
  const { dict } = useLanguage();
  const nextParam = encodeURIComponent(next);

  const resolvedTitle = title ?? dict.authGate.defaultTitle;
  const resolvedSubtitle = subtitle ?? dict.authGate.defaultSubtitle;
  const resolvedPerks = perks ?? dict.authGate.defaultPerks;

  // Logged in, or auth not configured locally → show the real page
  if (user || authDisabled) return <>{children}</>;

  // Still checking session
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-navy-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 pb-20 min-h-screen flex items-center">
        <div className="max-w-md mx-auto px-4 sm:px-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-gold-50 border border-gold-200 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
              <span className="text-xs text-gold-700 font-semibold tracking-wide uppercase">
                {dict.authGate.badge}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-3">{resolvedTitle}</h1>
            <p className="text-sm text-navy-500 leading-relaxed mb-7 max-w-sm mx-auto">
              {resolvedSubtitle}
            </p>

            {/* Perks */}
            <div className="rounded-2xl border border-navy-100 bg-navy-50/50 p-5 mb-7 text-left">
              <ul className="space-y-3">
                {resolvedPerks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2.5 text-sm text-navy-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    {perk}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href={`/signup?next=${nextParam}`}
              className="w-full flex items-center justify-center gap-2.5 px-5 py-3 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-700 transition-all"
            >
              {dict.authGate.createAccount}
            </Link>

            <p className="text-sm text-navy-500 mt-4">
              {dict.authGate.alreadyHaveAccount}{" "}
              <Link
                href={`/login?next=${nextParam}`}
                className="font-semibold text-navy-900 underline underline-offset-4 hover:text-navy-600"
              >
                {dict.authGate.signIn}
              </Link>
            </p>

            <p className="text-xs text-navy-400 mt-4">
              {dict.authGate.consent}
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
