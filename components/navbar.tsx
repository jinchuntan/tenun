"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Layers, Loader2, LogOut, LayoutDashboard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async () => {
    const supabase = createClient();
    if (!supabase) return;
    setSigningIn(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const avatarLetter = user?.email?.charAt(0).toUpperCase() ?? "U";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-navy-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">

          {/* Logo — left */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy-700 to-gold-500 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-navy-900 tracking-tight">Tenun</span>
          </Link>

          {/* Nav links — absolutely centred */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 bg-navy-50 border border-navy-100 rounded-full px-1.5 py-1.5">
            <Link
              href="/#features"
              className="px-5 py-1.5 rounded-full text-sm font-medium text-navy-600 hover:bg-white hover:text-navy-900 hover:shadow-sm transition-all"
            >
              How we help
            </Link>
            <Link
              href="/#companies"
              className="px-5 py-1.5 rounded-full text-sm font-medium text-navy-600 hover:bg-white hover:text-navy-900 hover:shadow-sm transition-all"
            >
              Partner with us
            </Link>
          </div>

          {/* Right — sign in / user */}
          <div className="hidden md:flex items-center flex-shrink-0">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 rounded-full bg-navy-800 flex items-center justify-center text-white text-sm font-bold">
                    {avatarLetter}
                  </div>
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-navy-100 shadow-lg py-1 z-50"
                    >
                      <div className="px-3 py-2 border-b border-navy-50">
                        <p className="text-xs text-navy-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-navy-700 hover:bg-navy-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                disabled={signingIn}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-navy-900 text-white text-sm font-medium hover:bg-navy-700 disabled:opacity-50 transition-all"
              >
                {signingIn ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Signing in...</>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Sign in
                  </>
                )}
              </button>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-navy-700"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-b border-navy-100/50"
          >
            <div className="px-4 py-4 space-y-1">
              <Link
                href="/#features"
                className="block text-sm text-navy-600 hover:text-navy-900 px-3 py-2 rounded-lg hover:bg-navy-50 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                How we help
              </Link>
              <Link
                href="/#companies"
                className="block text-sm text-navy-600 hover:text-navy-900 px-3 py-2 rounded-lg hover:bg-navy-50 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Partner with us
              </Link>
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block text-sm text-navy-600 hover:text-navy-900 px-3 py-2 rounded-lg hover:bg-navy-50 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left text-sm text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setMobileOpen(false); handleSignIn(); }}
                  disabled={signingIn}
                  className="w-full flex items-center justify-center gap-2 mt-2 py-2.5 rounded-full bg-navy-900 text-white text-sm font-medium disabled:opacity-50"
                >
                  {signingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Sign in with Google
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
