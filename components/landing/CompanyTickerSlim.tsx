"use client";

import Image from "next/image";
import Link from "next/link";
import { companies } from "@/lib/data/company-jobs";
import { useLanguage } from "@/components/i18n/LanguageProvider";

// The marquee keyframe scrolls translateX(-50%), so the row must be two
// IDENTICAL halves. Each half repeats the company set enough times to stay
// wider than any viewport — otherwise the loop reveals a gap before it resets.
const HALF = [...companies, ...companies, ...companies];
const ITEMS = [...HALF, ...HALF];

export function CompanyTickerSlim() {
  const { dict } = useLanguage();
  const t = dict.companyTicker;

  return (
    <div className="w-full bg-white border-b border-beige-300/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 sm:gap-4 h-14">
          {/* Left label */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-navy-700 whitespace-nowrap">
              {t.label}
            </span>
          </div>

          <div className="hidden sm:block h-6 w-px bg-beige-300/70 shrink-0" />

          {/* Scrolling company pills — slowed to a calm 60s loop; the base
              .animate-marquee:hover rule pauses it on hover (no `no-pause` here). */}
          <div className="relative flex-1 overflow-hidden fade-x-mask">
            <div
              className="flex w-max animate-marquee items-center py-1.5"
              style={{ animationDuration: "60s" }}
            >
              {ITEMS.map((company, i) => (
                <Link
                  key={`${company.slug}-${i}`}
                  href={`/companies/${company.slug}`}
                  aria-label={`${company.name} — ${company.jobs.length} ${t.rolesOpen}`}
                  className="group flex-shrink-0 mx-1.5 inline-flex items-center gap-2 rounded-full border border-beige-300 bg-white pl-1.5 pr-3 py-1 hover:border-gold-300 hover:shadow-sm transition-all"
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-beige-50 overflow-hidden shrink-0">
                    <Image
                      src={company.logo}
                      alt={`${company.name} logo`}
                      width={28}
                      height={28}
                      className="object-contain"
                      style={{ maxHeight: 28, maxWidth: 28 }}
                      unoptimized
                    />
                  </span>
                  <span className="text-[11px] font-medium text-navy-600 group-hover:text-navy-900 whitespace-nowrap transition-colors">
                    <span className="font-semibold text-navy-800">{company.name}</span>
                    <span className="mx-1 text-beige-400">·</span>
                    {company.jobs.length} {t.rolesOpen}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
