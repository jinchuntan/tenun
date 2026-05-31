"use client";

import React from "react";
import Link from "next/link";
import { Layers } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-9">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy-400 to-gold-500 flex items-center justify-center">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">Tenun</span>
            </div>
            <p className="text-navy-300 text-sm max-w-sm leading-relaxed mb-3">
              Career discovery for students and fresh graduates who don&apos;t know their job
              title yet. Built with TalentBank, Malaysia&apos;s leading talent placement platform.
            </p>
          </div>

          {/* Platform links */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-gold-400">Platform</h4>
            <ul className="space-y-2 text-sm text-navy-300">
              <li><Link href="/#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="/#partners" className="hover:text-white transition-colors">Partner Companies</Link></li>
              <li><Link href="/#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/#faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* For companies */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-gold-400">For Employers</h4>
            <ul className="space-y-2 text-sm text-navy-300">
              <li><Link href="/#companies" className="hover:text-white transition-colors">Why Tenun</Link></li>
              <li>
                <a href="mailto:partnerships@tenun.career" className="hover:text-white transition-colors">
                  Partner with us
                </a>
              </li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Recruiter Portal</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-navy-800 mt-7 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-navy-400">
            &copy; {currentYear} Tenun. All rights reserved.
          </p>
          <p className="text-xs text-navy-500">
            Tenun helps you explore possibilities. It does not guarantee employment outcomes.
          </p>
        </div>
      </div>
    </footer>
  );
}
