"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, FileX2, PhoneCall, UserCheck, ArrowUpRight, FileText } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const BUILD_CV_HREF = "/profile?upload=true&from=landing";

// Icon per stat: scan time (clock), ATS rejection (file-x), more callbacks
// (phone), recruiters verifying candidates online (user-check).
const STAT_STYLES = [
  { rotate: -3, mtClass: "", icon: Clock },
  { rotate: 2, mtClass: "sm:mt-6", icon: FileX2 },
  { rotate: -2, mtClass: "", icon: PhoneCall },
  { rotate: 3, mtClass: "sm:mt-6", icon: UserCheck },
];

export function CVSupportSection() {
  const { dict } = useLanguage();
  const c = dict.cvSupport;
  const STATS = c.stats.map((stat, i) => ({ ...stat, ...STAT_STYLES[i] }));
  return (
    <section className="py-16 md:py-24 bg-navy-900 relative overflow-hidden">
      <div className="absolute inset-0 dot-pattern opacity-[0.06] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        {/* Heading + paragraph */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-end mb-14">
          <h2 className="font-display text-4xl sm:text-5xl text-white leading-[0.95]">
            {c.titleLine1}
            <br />
            {c.titleLine2}
          </h2>
          <p className="text-navy-200 text-sm sm:text-base leading-relaxed">
            {c.paragraph}
          </p>
        </div>

        {/* Tilted stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
            <motion.article
              key={s.stat}
              initial={{ opacity: 0, y: 20, rotate: s.rotate }}
              whileInView={{ opacity: 1, y: 0, rotate: s.rotate }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              whileHover={{
                scale: 1.05,
                y: -14,
                rotate: 0,
                zIndex: 20,
                transition: { type: "spring", stiffness: 300, damping: 20 },
              }}
              className={`relative rounded-3xl bg-beige-100 border border-beige-300/40 p-5 shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-gold-500/25 hover:border-gold-400 ${s.mtClass}`}
            >
              <span className="absolute -top-3 -right-3 w-11 h-11 rounded-full bg-white border border-beige-300 shadow-md flex items-center justify-center">
                <Icon className="w-5 h-5 text-navy-700" />
              </span>
              <div className="font-display text-3xl text-navy-900 mb-1">{s.stat}</div>
              <p className="text-xs font-semibold text-navy-500 mb-3 leading-snug">{s.label}</p>
              <p className="text-sm text-navy-700 leading-relaxed mb-4">{s.body}</p>
              <Link
                href={BUILD_CV_HREF}
                className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:text-navy-900 transition-colors"
              >
                {c.viewSample} <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </motion.article>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href={BUILD_CV_HREF}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gold-500 text-navy-900 text-sm font-bold hover:bg-gold-400 transition-all shadow-lg shadow-gold-500/20"
          >
            <FileText className="w-4 h-4" />
            {c.buildCv}
          </Link>
          <p className="text-xs text-navy-300 mt-4">
            {c.ctaNote}
          </p>
        </div>
      </div>
    </section>
  );
}
