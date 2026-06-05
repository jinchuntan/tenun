"use client";

import { motion } from "framer-motion";
import { Users, Star, FolderCheck, Clock } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const STAT_META = [
  { value: "24", icon: Users, accent: "text-navy-700 bg-navy-50" },
  { value: "8", icon: Star, accent: "text-gold-700 bg-gold-50" },
  { value: "5", icon: FolderCheck, accent: "text-emerald-700 bg-emerald-50" },
  { value: "11", icon: Clock, accent: "text-navy-500 bg-beige-200" },
];

const CANDIDATE_META = [
  { name: "Candidate A", fit: 86, skills: "SQL, Excel, dashboard project" },
  { name: "Candidate B", fit: 79, skills: "Python, research, analytics" },
  { name: "Candidate C", fit: 74, skills: "Power BI, finance project" },
];

export function EmployerPortalPreview() {
  const { dict } = useLanguage();
  const p = dict.portalPreview;
  const STATS = STAT_META.map((s, i) => ({ ...s, label: p.statLabels[i] }));
  const CANDIDATES = CANDIDATE_META.map((c, i) => ({ ...c, interest: p.candidateInterests[i] }));
  return (
    <section id="portal-preview" className="py-16 md:py-24 bg-navy-900 relative overflow-hidden">
      <div className="absolute inset-0 dot-pattern opacity-[0.06] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl text-white leading-tight mb-3">
            {p.title}
          </h2>
          <p className="text-sm sm:text-base text-navy-200 leading-relaxed">
            {p.subtitle}
          </p>
        </div>

        {/* Mock dashboard card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl bg-white shadow-2xl shadow-black/30 overflow-hidden border border-beige-300/40"
        >
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-5 py-3 bg-beige-100 border-b border-beige-300/60">
            <span className="w-3 h-3 rounded-full bg-red-300" />
            <span className="w-3 h-3 rounded-full bg-gold-300" />
            <span className="w-3 h-3 rounded-full bg-emerald-300" />
            <span className="ml-3 text-xs font-medium text-navy-400">tenun.career / employer / shortlist</span>
          </div>

          <div className="p-5 sm:p-7">
            {/* Role header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <p className="text-xs font-semibold text-navy-400 uppercase tracking-wider mb-1">{p.openRole}</p>
                <h3 className="text-xl font-bold text-navy-900">{p.roleTitle}</h3>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {p.matchingLive}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {STATS.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="rounded-2xl border border-beige-300/60 bg-beige-50 p-4">
                    <span className={`flex items-center justify-center w-8 h-8 rounded-lg mb-3 ${s.accent}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <div className="font-display text-2xl text-navy-900 leading-none mb-1">{s.value}</div>
                    <p className="text-[11px] text-navy-500 leading-snug">{s.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Candidate rows */}
            <div className="space-y-2.5">
              {CANDIDATES.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center gap-4 rounded-2xl border border-beige-300/60 bg-white p-3.5 hover:border-gold-300 hover:shadow-sm transition-all"
                >
                  <div className="w-9 h-9 rounded-full bg-navy-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {c.name.split(" ")[1]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-navy-900">{c.name}</p>
                    <p className="text-xs text-navy-500 truncate">{c.skills} · {c.interest}</p>
                  </div>
                  <div className="shrink-0 text-right w-24">
                    <div className="text-sm font-bold text-navy-900">{c.fit}{p.fitSuffix}</div>
                    <div className="mt-1 h-1.5 rounded-full bg-beige-200 overflow-hidden">
                      <div className="h-full rounded-full bg-gold-500" style={{ width: `${c.fit}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <p className="text-center text-xs text-navy-400 mt-5">
          {p.note}
        </p>
      </div>
    </section>
  );
}
