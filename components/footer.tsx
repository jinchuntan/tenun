"use client";

import React from "react";
import Link from "next/link";
import { Layers, Github, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy-400 to-gold-500 flex items-center justify-center">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">Tenun</span>
            </div>
            <p className="text-navy-300 text-sm max-w-md leading-relaxed">
              Tenun helps you weave skills, experience, goals, and market
              opportunities into realistic career pathways. A career
              decision-support platform for students, graduates, and
              early-career professionals.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-gold-400">
              Product
            </h4>
            <ul className="space-y-2 text-sm text-navy-300">
              <li>
                <Link href="/profile" className="hover:text-white transition-colors">
                  Start Career Weave
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 text-gold-400">
              Connect
            </h4>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-navy-800 flex items-center justify-center hover:bg-navy-700 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-navy-800 flex items-center justify-center hover:bg-navy-700 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-navy-800 flex items-center justify-center hover:bg-navy-700 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="border-t border-navy-800 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-navy-400">
            &copy; {currentYear} Tenun — The Career Weaving OS. All rights
            reserved.
          </p>
          <p className="text-xs text-navy-500">
            Built for the Career OS Hackathon. Tenun does not predict futures —
            it helps you explore possibilities.
          </p>
        </div>
      </div>
    </footer>
  );
}
