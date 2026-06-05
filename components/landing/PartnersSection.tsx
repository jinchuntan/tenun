"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { companies } from "@/lib/data/company-jobs";
import { useLanguage } from "@/components/i18n/LanguageProvider";

// The marquee keyframe scrolls translateX(-50%), so the strip must be two
// IDENTICAL halves. Each half repeats the company set enough times to stay wider
// than any viewport — otherwise the loop reveals an empty gap before it resets.
const HALF = [...companies, ...companies, ...companies];
const ITEMS = [...HALF, ...HALF];

export function PartnersSection() {
  const { dict } = useLanguage();
  const p = dict.partners;
  return (
    <section id="partners" className="py-16 md:py-20 bg-beige-100/60 border-y border-beige-300/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center mb-10">
        <p className="text-xs font-semibold text-gold-600 uppercase tracking-widest mb-2">
          {p.eyebrow}
        </p>
        <h2 className="font-display text-2xl sm:text-3xl text-navy-900 leading-tight mb-3">
          {p.titleLine1}
          <br className="hidden sm:block" />{" "}
          {p.titleLine2}
        </h2>
        <p className="text-sm text-navy-600 leading-relaxed max-w-xl mx-auto">
          {p.subtitle}
        </p>
      </div>

      <div className="relative overflow-hidden fade-x-mask py-8">
        <div className="flex w-max animate-marquee no-pause items-center">
          {ITEMS.map((company, i) => (
            <Link
              key={`${company.slug}-${i}`}
              href={`/companies/${company.slug}`}
              className="flex-shrink-0 mx-5 flex items-center justify-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:scale-125 hover:z-10 transition-all duration-300 ease-out"
              style={{ height: company.logoSize ?? 64 }}
              aria-label={`${company.name} — view open roles`}
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
            </Link>
          ))}
        </div>
      </div>

      <div className="text-center mt-10">
        <Link
          href={`/companies/${companies[0]?.slug ?? ""}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-800 hover:text-gold-600 transition-colors"
        >
          {p.browseAll} <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
