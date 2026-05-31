"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  User, GitBranch, Globe, Zap, Briefcase,
  Users, Send, FileText, Menu, X, LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export type DashboardSection =
  | "profile" | "paths" | "atlas" | "skills"
  | "opportunities" | "mentors" | "outreach" | "cv";

interface NavItem {
  id: DashboardSection;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: "profile",       label: "Profile",       icon: <User size={18} /> },
  { id: "paths",         label: "Paths",         icon: <GitBranch size={18} /> },
  { id: "skills",        label: "Skills",        icon: <Zap size={18} /> },
  { id: "opportunities", label: "Opportunities", icon: <Briefcase size={18} /> },
  { id: "atlas",         label: "Atlas",         icon: <Globe size={18} /> },
  { id: "mentors",       label: "Mentors",       icon: <Users size={18} /> },
  { id: "outreach",      label: "Outreach",      icon: <Send size={18} /> },
  { id: "cv",            label: "Build CV",      icon: <FileText size={18} /> },
];

const MOBILE_PRIMARY: DashboardSection[] = ["profile", "paths", "skills", "mentors", "cv"];

interface Props {
  userName: string;
  currentRole: string;
  targetJob?: string;
  children: React.ReactNode;
}

export function DashboardShell({ userName, currentRole, targetJob, children }: Props) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<DashboardSection>("profile");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  async function handleSignOut() {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    router.push("/");
  }

  // Intersection observer — highlights active section as user scrolls
  useEffect(() => {
    const sectionEls = NAV_ITEMS.map((item) => document.getElementById(`section-${item.id}`)).filter(Boolean);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the entry closest to the top of the viewport
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = visible[0].target.id.replace("section-", "") as DashboardSection;
          setActiveSection(id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    sectionEls.forEach((el) => observerRef.current!.observe(el!));
    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = useCallback((id: DashboardSection) => {
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setDrawerOpen(false);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f5f0e8]">
      {/* Desktop sidebar */}
      <aside
        className={[
          "hidden md:flex flex-col fixed top-0 left-0 h-full z-40 bg-[#0a1628] transition-all duration-200 ease-out overflow-hidden",
          sidebarExpanded ? "w-48" : "w-[60px]",
        ].join(" ")}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-white/5 shrink-0 overflow-hidden">
          <span className="text-[#d4a017] font-bold text-sm shrink-0">T</span>
          {sidebarExpanded && (
            <span className="ml-2 text-white text-sm font-semibold whitespace-nowrap overflow-hidden">
              Tenun
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-0.5 py-3 px-2 overflow-hidden">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                aria-label={item.label}
                className={[
                  "flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors w-full text-left whitespace-nowrap overflow-hidden",
                  isActive
                    ? "bg-[#d4a017]/15 text-[#d4a017]"
                    : "text-white/40 hover:text-white hover:bg-white/5",
                ].join(" ")}
              >
                <span className="shrink-0">{item.icon}</span>
                {sidebarExpanded && (
                  <span className="text-xs font-medium overflow-hidden text-ellipsis">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main content — offset by sidebar width on desktop */}
      <div className="flex-1 flex flex-col md:ml-[60px] min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 bg-[#0a1628] flex items-center px-4 gap-3 border-b border-white/5">
          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white/60 hover:text-white transition-colors shrink-0"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* Tenun logo — navigates to landing page */}
          <button
            onClick={() => router.push("/")}
            className="hidden md:flex items-center gap-1.5 shrink-0 hover:opacity-80 transition-opacity"
            aria-label="Go to home"
          >
            <span className="text-[#d4a017] font-bold text-sm tracking-wide">Tenun</span>
          </button>

          <div className="hidden md:block w-px h-4 bg-white/10 shrink-0" />

          {/* User info */}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{userName}</p>
            <p className="text-white/40 text-xs truncate">{currentRole}</p>
          </div>

          {targetJob && (
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-[#d4a017]/15 text-[#d4a017] border border-[#d4a017]/20 shrink-0">
              {targetJob}
            </span>
          )}

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors text-xs"
            aria-label="Sign out"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Mobile bottom tab bar */}
        <nav className="md:hidden flex bg-[#0a1628] border-t border-white/5 shrink-0 sticky bottom-0 z-30">
          {NAV_ITEMS.filter((item) => MOBILE_PRIMARY.includes(item.id)).map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={[
                "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] transition-colors",
                activeSection === item.id ? "text-[#d4a017]" : "text-white/40",
              ].join(" ")}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] text-white/40"
          >
            <Menu size={18} />
            <span>More</span>
          </button>
        </nav>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
          <aside className="relative w-56 bg-[#0a1628] flex flex-col shadow-xl">
            <div className="h-14 flex items-center justify-between px-4 border-b border-white/5">
              <button
                onClick={() => router.push("/")}
                className="text-[#d4a017] font-bold hover:opacity-80 transition-opacity"
              >
                Tenun
              </button>
              <button onClick={() => setDrawerOpen(false)} className="text-white/60 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 flex flex-col gap-0.5 py-3 px-2">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={[
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors w-full text-left",
                    activeSection === item.id
                      ? "bg-[#d4a017]/15 text-[#d4a017]"
                      : "text-white/60 hover:text-white hover:bg-white/5",
                  ].join(" ")}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="p-3 border-t border-white/5">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors w-full"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
