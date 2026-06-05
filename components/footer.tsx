"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const WEAVER_HREFS = [
  "/#how-it-works",
  "/",
  "/profile?upload=true&from=landing",
  "/#faq",
];

const EMPLOYER_HREFS = [
  "/employers#why",
  "/employers#employer-form",
  "/employers#candidate-signal",
  "/employers#portal-preview",
];

export function Footer() {
  const { dict } = useLanguage();
  const ft = dict.footer;
  const currentYear = new Date().getFullYear();
  const WEAVER_LINKS = ft.weaverLinks.map((label, i) => ({ label, href: WEAVER_HREFS[i] }));
  const EMPLOYER_LINKS = ft.employerLinks.map((label, i) => ({ label, href: EMPLOYER_HREFS[i] }));

  return (
    <footer className="bg-beige-200 border-t border-beige-300/70 text-navy-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <span className="text-2xl font-black tracking-tight">Tenun</span>
            <p className="text-navy-600 text-sm max-w-sm leading-relaxed mt-4">
              {ft.tagline}
            </p>
          </div>

          {/* For Weavers */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-navy-900">{ft.forWeavers}</h4>
            <ul className="space-y-2.5 text-sm text-navy-600">
              {WEAVER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-gold-600 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-navy-900">{ft.forEmployers}</h4>
            <ul className="space-y-2.5 text-sm text-navy-600">
              {EMPLOYER_LINKS.map((link) =>
                link.href.startsWith("mailto:") ? (
                  <li key={link.label}>
                    <a href={link.href} className="hover:text-gold-600 transition-colors">
                      {link.label}
                    </a>
                  </li>
                ) : (
                  <li key={link.label}>
                    <Link href={link.href} className="hover:text-gold-600 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-beige-300/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-navy-500">
            &copy; {currentYear} Tenun. {ft.rights}
          </p>
          <p className="text-xs text-navy-500">
            {ft.disclaimer}
          </p>
        </div>
      </div>
    </footer>
  );
}
