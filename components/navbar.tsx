"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Layers, LogOut, LayoutDashboard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
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
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-full text-sm font-medium text-navy-700 hover:bg-navy-50 transition-all"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-full bg-navy-900 text-white text-sm font-medium hover:bg-navy-700 transition-all"
                >
                  Sign up
                </Link>
              </div>
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
                <div className="space-y-2 mt-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center py-2.5 rounded-full border border-navy-200 text-navy-900 text-sm font-medium"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center py-2.5 rounded-full bg-navy-900 text-white text-sm font-medium"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
