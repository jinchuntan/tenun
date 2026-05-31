"use client";

import Image from "next/image";
import Link from "next/link";
import { companies } from "@/lib/data/company-jobs";
import { ChevronRight } from "lucide-react";

const ITEMS = [...companies, ...companies];

// ── Slim strip — sits above the hero headline ─────────────────────────────

export function CompanyTickerSlim() {
  return (
    <div className="w-full overflow-hidden bg-white border-b border-navy-100/60 py-3.5">
      <div className="flex items-center gap-4">
        {/* Label */}
        <span className="flex-shrink-0 pl-4 sm:pl-6 text-[11px] font-semibold text-navy-400 uppercase tracking-widest whitespace-nowrap">
          Now hiring through Tenun
        </span>

        {/* Scrolling logos */}
        <div className="relative flex-1 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          <div className="flex animate-marquee">
            {ITEMS.map((company, i) => (
              <Link
                key={`slim-${company.slug}-${i}`}
                href={`/companies/${company.slug}`}
                className="flex-shrink-0 mx-2.5 flex items-center gap-2.5 px-3.5 py-2 rounded-full border border-navy-100 bg-white hover:border-navy-300 hover:shadow-sm transition-all group"
              >
                <div
                  className="flex items-center justify-center overflow-hidden flex-shrink-0"
                  style={{ width: 28, height: 28 }}
                >
                  <Image
                    src={company.logo}
                    alt={`${company.name} logo`}
                    width={28}
                    height={28}
                    className="object-contain w-full h-full"
                    unoptimized
                  />
                </div>
                <span className="text-[11px] text-navy-500 font-medium group-hover:text-navy-900 transition-colors whitespace-nowrap">
                  {company.jobs.length} roles open
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Full ticker — used in the page body ───────────────────────────────────

export function CompanyTicker() {
  return (
    <section className="py-10 border-b border-navy-100 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
        <div className="flex items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-gold-600 uppercase tracking-widest mb-1">
              Our proven partners
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-navy-900 mb-2 whitespace-nowrap">
              We partner with the companies you want to work for.
            </h2>
            <p className="text-sm text-navy-500 leading-relaxed">
              Every candidate is vetted through Tenun before we put them forward. When
              you apply through us, these partners know you&apos;ve been vouched for, not
              just another name in the pile.
            </p>
          </div>
          <Link
            href="/companies/maybank"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-navy-500 hover:text-navy-900 transition-colors flex-shrink-0 pb-1"
          >
            Browse all companies <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee no-pause items-center">
          {ITEMS.map((company, i) => (
            <div
              key={`${company.slug}-${i}`}
              className="flex-shrink-0 mx-8 flex items-center justify-center"
              style={{ height: company.logoSize ?? 64 }}
            >
              <Image
                src={company.logo}
                alt={`${company.name} logo`}
                width={company.logoSize ?? 64}
                height={company.logoSize ?? 64}
                className="object-contain"
                style={{ maxHeight: company.logoSize ?? 64 }}
                unoptimized
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
