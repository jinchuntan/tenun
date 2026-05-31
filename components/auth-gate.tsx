"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useAuth, signInWithGoogle } from "@/lib/use-auth";

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
  title = "First, let's get you set up",
  subtitle = "Create your free Weaver account to continue. It takes one tap — no forms, no credit card, no spam.",
  perks = [
    "Save your career matches and come back anytime",
    "Build and grow your CV with us over time",
    "Get matched to real jobs at our partner companies",
  ],
  children,
}: AuthGateProps) {
  const { user, loading, authDisabled } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

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

  const handleSignIn = async () => {
    setSigningIn(true);
    await signInWithGoogle(next);
  };

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
                Free for Weavers
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-3">{title}</h1>
            <p className="text-sm text-navy-500 leading-relaxed mb-7 max-w-sm mx-auto">
              {subtitle}
            </p>

            {/* Perks */}
            <div className="rounded-2xl border border-navy-100 bg-navy-50/50 p-5 mb-7 text-left">
              <ul className="space-y-3">
                {perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2.5 text-sm text-navy-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    {perk}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={handleSignIn}
              disabled={signingIn}
              className="w-full flex items-center justify-center gap-2.5 px-5 py-3 bg-white border-2 border-navy-200 rounded-xl text-sm font-semibold text-navy-900 hover:border-navy-400 hover:bg-navy-50 disabled:opacity-60 transition-all"
            >
              {signingIn ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            <p className="text-xs text-navy-400 mt-4">
              By continuing you agree to let Tenun build your career profile. We never post or share without your say-so.
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
