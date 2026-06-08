"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setActiveSection, type DashboardSection } from "@/store/slices/dashboardSlice";

import { WeaverTabBar, PANEL_BG } from "./WeaverTabBar";
import { WeaverNavButtons, type NavTab } from "./WeaverNavButtons";

const UPLOAD_ROUTE = "/profile?upload=true&from=dashboard";

export interface WeaverTab extends NavTab {
  content: React.ReactNode;
}

interface Props {
  userName: string;
  currentRole: string;
  targetJob?: string;
  tabs: WeaverTab[];
}

/**
 * Tabbed dashboard canvas — replaces the old continuous-scroll DashboardShell.
 * One focused tab is visible at a time; the active tab is managed in Redux
 * (`dashboard.activeSection`) so other panes can drive navigation too.
 */
export function WeaverDashboardShell({ userName, currentRole, targetJob, tabs }: Props) {
  const router = useRouter();
  const { dict } = useLanguage();
  const dispatch = useAppDispatch();
  const activeSection = useAppSelector((s) => s.dashboard.activeSection);

  const navTabs: NavTab[] = tabs.map(({ id, label }) => ({ id, label }));
  const activeTab = tabs.find((t) => t.id === activeSection) ?? tabs[0];

  // Keep Redux in a valid state if it ever points at a tab we don't render.
  useEffect(() => {
    if (!tabs.some((t) => t.id === activeSection)) {
      dispatch(setActiveSection(tabs[0].id));
    }
  }, [activeSection, tabs, dispatch]);

  function go(id: DashboardSection) {
    dispatch(setActiveSection(id));
  }

  async function handleSignOut() {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f0e8]">
      {/* Top bar */}
      <header className="sticky top-0 z-30 h-14 bg-[#0a1628] flex items-center px-3 sm:px-4 gap-2 sm:gap-3 border-b border-white/5">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 shrink-0 hover:opacity-80 transition-opacity"
          aria-label={dict.dashboardShell.goHome}
        >
          <span className="text-[#d4a017] font-bold text-sm tracking-wide">Tenun</span>
        </button>

        <div className="w-px h-4 bg-white/10 shrink-0" />

        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{userName}</p>
          <p className="text-white/40 text-xs truncate">{currentRole}</p>
        </div>

        {targetJob && (
          <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-[#d4a017]/15 text-[#d4a017] border border-[#d4a017]/20 shrink-0">
            {targetJob}
          </span>
        )}

        <button
          onClick={() => router.push(UPLOAD_ROUTE)}
          className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#d4a017] text-[#0a1628] hover:bg-[#e0ad1c] transition-colors text-xs font-semibold"
          title="Upload your CV, resume, or portfolio document"
        >
          <Upload size={15} />
          <span className="hidden sm:inline">{dict.dashboardShell.uploadCvPortfolio}</span>
          <span className="sm:hidden">{dict.dashboardShell.upload}</span>
        </button>

        <button
          onClick={handleSignOut}
          className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors text-xs"
          aria-label={dict.dashboardShell.signOut}
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">{dict.dashboardShell.signOut}</span>
        </button>
      </header>

      {/* Tabbed canvas */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-8">
        <WeaverTabBar
          tabs={navTabs}
          activeId={activeTab.id}
          onSelect={go}
          moreLabel={dict.dashboardShell.more}
        />

        <div
          className="rounded-3xl shadow-sm p-4 sm:p-7 min-h-[60vh] flex flex-col"
          style={{ backgroundColor: PANEL_BG }}
        >
          <div className="flex-1" role="tabpanel">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                {activeTab.content}
              </motion.div>
            </AnimatePresence>
          </div>

          <WeaverNavButtons tabs={navTabs} activeId={activeTab.id} onNavigate={go} />
        </div>
      </main>
    </div>
  );
}
