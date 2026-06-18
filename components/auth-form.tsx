"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Mail, CheckCircle2, Search, Briefcase } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
} from "@/lib/use-auth";
import { destinationFor, type AccountType } from "@/lib/account";
import { useLanguage } from "@/components/i18n/LanguageProvider";

type Mode = "login" | "signup";

interface AuthFormProps {
  mode: Mode;
  /** Where to send the user after a successful sign-in. Falls back to the
   *  account-type home dashboard when not provided. */
  next?: string | null;
}

export function AuthForm({ mode, next }: AuthFormProps) {
  const router = useRouter();
  const { dict } = useLanguage();
  const t = mode === "login" ? dict.auth.login : dict.auth.signup;
  const altHref = mode === "login" ? "/signup" : "/login";

  /** Turn a Supabase/Error into a friendly message. */
  function messageFor(e: unknown): string {
    if (e instanceof Error) {
      const m = e.message.toLowerCase();
      if (m.includes("invalid login credentials")) return dict.auth.errWrongCredentials;
      if (m.includes("already registered") || m.includes("already been registered"))
        return dict.auth.errAlreadyRegistered;
      if (m.includes("email not confirmed"))
        return dict.auth.errEmailNotConfirmed;
      return e.message;
    }
    return dict.auth.errGeneric;
  }

  /** Friendly text for the `auth_error` param the callback route may set. */
  function friendlyCallbackError(raw: string): string {
    if (raw === "missing_code") return dict.auth.errSignInIncomplete;
    return decodeURIComponent(raw);
  }

  // Surface an error bounced back from the OAuth callback route.
  const callbackError = useSearchParams().get("auth_error");

  const [accountType, setAccountType] = useState<AccountType>("candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    callbackError ? friendlyCallbackError(callbackError) : null
  );
  const [confirmSent, setConfirmSent] = useState(false);

  const handleGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle(next ?? "", mode === "signup" ? accountType : undefined);
      // On success the browser is redirected to Google; no further code runs.
    } catch (e) {
      setError(messageFor(e));
      setGoogleLoading(false);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError(dict.auth.errEmailPassword);
      return;
    }
    if (mode === "signup" && password.length < 6) {
      setError(dict.auth.errPasswordLength);
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "login") {
        const user = await signInWithEmail(email, password);
        router.push(destinationFor(user?.user_metadata?.account_type, next));
        router.refresh();
      } else {
        const target = destinationFor(accountType, next);
        const { needsConfirmation } = await signUpWithEmail(email, password, target, accountType);
        if (needsConfirmation) {
          setConfirmSent(true);
        } else {
          router.push(target);
          router.refresh();
        }
      }
    } catch (e) {
      setError(messageFor(e));
    } finally {
      setSubmitting(false);
    }
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
          >
            {confirmSent ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 mb-5">
                  <Mail className="w-6 h-6 text-emerald-500" />
                </div>
                <h1 className="text-2xl font-bold text-navy-900 mb-3">{dict.auth.checkEmail}</h1>
                <p className="text-sm text-navy-500 leading-relaxed max-w-sm mx-auto">
                  {dict.auth.confirmSent}{" "}
                  <span className="font-semibold text-navy-700">{email}</span>{dict.auth.confirmInstructions}
                </p>
                <Link
                  href="/login"
                  className="inline-block mt-7 text-sm font-semibold text-navy-900 underline underline-offset-4 hover:text-navy-600"
                >
                  {dict.auth.backToSignIn}
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-7">
                  <div className="inline-flex items-center gap-2 bg-gold-50 border border-gold-200 rounded-full px-4 py-1.5 mb-6">
                    <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                    <span className="text-xs text-gold-700 font-semibold tracking-wide uppercase">
                      {t.badge}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-3">{t.title}</h1>
                  <p className="text-sm text-navy-500 leading-relaxed max-w-sm mx-auto">
                    {t.subtitle}
                  </p>
                </div>

                {/* Role chooser — only when creating an account */}
                {mode === "signup" && (
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-navy-700 mb-2">{dict.auth.roleQuestion}</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {([
                        { value: "candidate" as const, icon: Search, label: dict.auth.roleCandidate, desc: dict.auth.roleCandidateDesc },
                        { value: "employer" as const, icon: Briefcase, label: dict.auth.roleEmployer, desc: dict.auth.roleEmployerDesc },
                      ]).map(({ value, icon: Icon, label, desc }) => {
                        const active = accountType === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setAccountType(value)}
                            aria-pressed={active}
                            className={[
                              "text-left rounded-xl border-2 p-3 transition-all",
                              active
                                ? "border-navy-900 bg-navy-50 ring-2 ring-navy-100"
                                : "border-navy-200 hover:border-navy-400",
                            ].join(" ")}
                          >
                            <Icon className={`w-5 h-5 mb-1.5 ${active ? "text-navy-900" : "text-navy-400"}`} />
                            <span className="block text-sm font-semibold text-navy-900">{label}</span>
                            <span className="block text-[11px] text-navy-500 leading-snug mt-0.5">{desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Google */}
                <button
                  onClick={handleGoogle}
                  disabled={googleLoading || submitting}
                  className="w-full flex items-center justify-center gap-2.5 px-5 py-3 bg-white border-2 border-navy-200 rounded-xl text-sm font-semibold text-navy-900 hover:border-navy-400 hover:bg-navy-50 disabled:opacity-60 transition-all"
                >
                  {googleLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> {dict.auth.connecting}</>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      {t.googleCta}
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="h-px flex-1 bg-navy-100" />
                  <span className="text-xs text-navy-400 font-medium">{dict.auth.or}</span>
                  <div className="h-px flex-1 bg-navy-100" />
                </div>

                {/* Email + password */}
                <form onSubmit={handleEmail} className="space-y-3">
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-navy-700 mb-1.5">
                      {dict.auth.emailLabel}
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={dict.auth.emailPlaceholder}
                      className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-sm text-navy-900 placeholder:text-navy-300 focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-xs font-semibold text-navy-700 mb-1.5">
                      {dict.auth.passwordLabel}
                    </label>
                    <input
                      id="password"
                      type="password"
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === "signup" ? dict.auth.passwordPlaceholderSignup : dict.auth.passwordPlaceholderLogin}
                      className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-sm text-navy-900 placeholder:text-navy-300 focus:outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 transition-all"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || googleLoading}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-700 disabled:opacity-60 transition-all"
                  >
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> {dict.auth.pleaseWait}</>
                    ) : (
                      <>
                        {mode === "signup" && <CheckCircle2 className="w-4 h-4" />}
                        {t.cta}
                      </>
                    )}
                  </button>
                </form>

                <p className="text-center text-sm text-navy-500 mt-6">
                  {t.altPrompt}{" "}
                  <Link
                    href={altHref}
                    className="font-semibold text-navy-900 underline underline-offset-4 hover:text-navy-600"
                  >
                    {t.altLink}
                  </Link>
                </p>
              </>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
