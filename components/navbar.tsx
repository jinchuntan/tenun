"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, LogOut, LayoutDashboard, ChevronDown,
  MessagesSquare, Bell, Globe,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { WeaverMegaMenu } from "@/components/landing/WeaverMegaMenu";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { LOCALE_LABEL, LOCALES, type Locale } from "@/lib/i18n";

const WEAVERS_HREF = "/";
const EMPLOYERS_HREF = "/employers";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const onEmployers = pathname?.startsWith("/employers");
  const onWeavers = pathname === "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [weaverOpen, setWeaverOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { locale, setLocale, dict } = useLanguage();

  // Flat list of the weaver links so the mobile drawer can reuse them
  const weaverLinks = [
    {
      group: dict.megaMenu.groups.careerWeave,
      links: [
        { label: dict.megaMenu.draftPortfolio, href: "/profile?upload=true&from=landing" },
        { label: dict.megaMenu.connectMentor, href: "/dashboard#section-mentors" },
        { label: dict.megaMenu.skillsGapPlan, href: "/dashboard#section-skills" },
      ],
    },
    {
      group: dict.megaMenu.groups.job,
      links: [
        { label: dict.megaMenu.findJob, href: "/#hero-search" },
        { label: dict.megaMenu.careerMatching, href: "/#hero-search" },
        { label: dict.megaMenu.interviewLab, href: "/dashboard#section-outreach" },
      ],
    },
    {
      group: dict.megaMenu.groups.projects,
      links: [
        { label: dict.megaMenu.exploreOthers, href: "/dashboard#section-atlas" },
        { label: dict.megaMenu.savedProjects, href: "/dashboard" },
      ],
    },
  ];

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Close the mega menu on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setWeaverOpen(false); setLangOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  // Hover intent helpers — keep the menu open while moving cursor into it
  const openWeaver = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setWeaverOpen(true);
  };
  const scheduleCloseWeaver = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setWeaverOpen(false), 140);
  };

  const avatarLetter = user?.email?.charAt(0).toUpperCase() ?? "U";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-beige-300/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">

          {/* Logo — left */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <span className="text-2xl font-black text-navy-900 tracking-tight">Tenun</span>
          </Link>

          {/* Segmented pill. The weaver mega menu only opens from the "For
              Weavers" segment; hovering "For Employers" closes it. The menu is a
              DOM descendant of the parent (with top-full + pt-3 bridge) so moving
              the cursor onto it never triggers a flicker. */}
          <div
            className="hidden md:block absolute left-1/2 -translate-x-1/2 z-50"
            onMouseLeave={scheduleCloseWeaver}
          >
            <div className="flex items-center gap-1 bg-beige-200/70 border border-beige-300/70 rounded-full p-1.5">
              <Link
                href={WEAVERS_HREF}
                onMouseEnter={openWeaver}
                className={[
                  "flex items-center gap-1.5 px-5 py-1.5 rounded-full text-sm font-semibold transition-all",
                  onWeavers || weaverOpen
                    ? "bg-white text-navy-900 shadow-sm"
                    : "text-navy-800 hover:bg-white/60",
                ].join(" ")}
              >
                {dict.nav.forWeavers}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${weaverOpen ? "rotate-180" : ""}`}
                />
              </Link>
              <Link
                href={EMPLOYERS_HREF}
                onMouseEnter={scheduleCloseWeaver}
                className={[
                  "px-5 py-1.5 rounded-full text-sm font-semibold transition-all",
                  onEmployers
                    ? "bg-white text-navy-900 shadow-sm"
                    : "text-navy-400 hover:text-navy-800 hover:bg-white/60",
                ].join(" ")}
              >
                {dict.nav.forEmployers}
              </Link>
            </div>

            <AnimatePresence>
              {weaverOpen && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[min(720px,calc(100vw-2rem))]"
                  onMouseEnter={openWeaver}
                  onMouseLeave={scheduleCloseWeaver}
                >
                  <WeaverMegaMenu onNavigate={() => setWeaverOpen(false)} />
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Right cluster */}
          <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => router.push("/#faq")}
              aria-label={dict.nav.helpFaq}
              className="p-2 rounded-full text-navy-700 hover:bg-beige-200/70 transition-colors"
            >
              <MessagesSquare className="w-[18px] h-[18px]" />
            </button>
            <button
              type="button"
              aria-label={dict.nav.notifications}
              className="relative p-2 rounded-full text-navy-700 hover:bg-beige-200/70 transition-colors"
            >
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white" />
            </button>

            {user ? (
              <div className="relative ml-1">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center"
                  aria-label={dict.common.userMenu}
                >
                  <div className="w-8 h-8 rounded-full bg-navy-900 flex items-center justify-center text-white text-sm font-bold">
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
                      className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-beige-300/70 shadow-lg py-1 z-50"
                    >
                      <div className="px-3 py-2 border-b border-beige-200">
                        <p className="text-xs text-navy-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-navy-700 hover:bg-beige-100 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        {dict.nav.dashboard}
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        {dict.nav.signOut}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-full bg-navy-900 text-white text-sm font-semibold hover:bg-navy-800 transition-all"
                >
                  {dict.nav.signIn}
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-full border border-navy-300 text-navy-900 text-sm font-semibold hover:border-navy-900 hover:bg-white transition-all"
                >
                  {dict.nav.signUp}
                </Link>
              </div>
            )}

            {/* Language switcher */}
            <div className="relative ml-1 pl-2 border-l border-beige-300/70">
              <button
                type="button"
                onClick={() => setLangOpen((o) => !o)}
                aria-label={dict.nav.language}
                aria-haspopup="menu"
                aria-expanded={langOpen}
                className="flex items-center gap-1 px-1.5 py-1 rounded-full text-navy-600 hover:bg-beige-200/70 transition-colors"
              >
                <span className="text-xs font-semibold">{LOCALE_LABEL[locale]}</span>
                <Globe className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.12 }}
                    role="menu"
                    className="absolute right-0 mt-2 w-44 bg-white rounded-xl border border-beige-300/70 shadow-lg py-1 z-50"
                  >
                    {LOCALES.map((l) => (
                      <button
                        key={l}
                        role="menuitemradio"
                        aria-checked={locale === l}
                        onClick={() => { setLocale(l); setLangOpen(false); }}
                        className={[
                          "w-full flex items-center justify-between gap-2 px-3 py-2 text-sm transition-colors",
                          locale === l
                            ? "text-navy-900 font-semibold bg-beige-100"
                            : "text-navy-700 hover:bg-beige-100",
                        ].join(" ")}
                      >
                        <span>{l === "en" ? dict.nav.english : dict.nav.malay}</span>
                        <span className="text-xs font-semibold text-navy-400">{LOCALE_LABEL[l]}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-navy-800"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={dict.common.toggleMenu}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Click-away backdrop for the desktop mega menu (covers clicks outside) */}
      <AnimatePresence>
        {weaverOpen && (
          <button
            type="button"
            aria-label={dict.common.closeMenu}
            tabIndex={-1}
            className="hidden md:block fixed inset-0 z-40 cursor-default"
            onClick={() => setWeaverOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-b border-beige-300/50 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Primary audience switch */}
              <div className="flex items-center gap-1 bg-beige-200/70 border border-beige-300/70 rounded-full p-1">
                <Link
                  href={WEAVERS_HREF}
                  onClick={() => setMobileOpen(false)}
                  className={[
                    "flex-1 text-center px-4 py-2 rounded-full text-sm font-semibold transition-all",
                    onWeavers ? "bg-white text-navy-900 shadow-sm" : "text-navy-700",
                  ].join(" ")}
                >
                  {dict.nav.forWeavers}
                </Link>
                <Link
                  href={EMPLOYERS_HREF}
                  onClick={() => setMobileOpen(false)}
                  className={[
                    "flex-1 text-center px-4 py-2 rounded-full text-sm font-semibold transition-all",
                    onEmployers ? "bg-white text-navy-900 shadow-sm" : "text-navy-700",
                  ].join(" ")}
                >
                  {dict.nav.forEmployers}
                </Link>
              </div>

              {/* Language toggle (mobile) */}
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs font-semibold text-navy-500">
                  <Globe className="w-3.5 h-3.5" /> {dict.nav.language}
                </span>
                <div className="flex items-center gap-1 bg-beige-200/70 border border-beige-300/70 rounded-full p-1">
                  {LOCALES.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLocale(l)}
                      aria-pressed={locale === l}
                      className={[
                        "px-3 py-1 rounded-full text-xs font-semibold transition-all",
                        locale === l ? "bg-white text-navy-900 shadow-sm" : "text-navy-600",
                      ].join(" ")}
                    >
                      {LOCALE_LABEL[l]}
                    </button>
                  ))}
                </div>
              </div>

              {weaverLinks.map((col) => (
                <div key={col.group}>
                  <p className="text-[11px] font-bold text-navy-400 uppercase tracking-widest mb-1.5">
                    {col.group}
                  </p>
                  <div className="space-y-0.5">
                    {col.links.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="block text-sm text-navy-700 hover:text-navy-900 px-3 py-2 rounded-lg hover:bg-beige-100 transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-2 border-t border-beige-200">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="block text-sm text-navy-700 hover:text-navy-900 px-3 py-2 rounded-lg hover:bg-beige-100 transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      {dict.nav.dashboard}
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left text-sm text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      {dict.nav.signOut}
                    </button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full text-center py-2.5 rounded-full bg-navy-900 text-white text-sm font-semibold"
                    >
                      {dict.nav.signIn}
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full text-center py-2.5 rounded-full border border-navy-300 text-navy-900 text-sm font-semibold"
                    >
                      {dict.nav.signUp}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
