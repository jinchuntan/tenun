"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-navy-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-navy-700 to-gold-500 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-navy-900 tracking-tight">
              Tenun
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/#features"
              className="text-sm text-navy-600 hover:text-navy-900 transition-colors"
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="text-sm text-navy-600 hover:text-navy-900 transition-colors"
            >
              How It Works
            </Link>
            <Link href="/profile">
              <Button size="sm">Start Career Weave</Button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-navy-700"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-b border-navy-100/50"
          >
            <div className="px-4 py-4 space-y-3">
              <Link
                href="/#features"
                className="block text-sm text-navy-600 hover:text-navy-900 py-2"
                onClick={() => setMobileOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/#how-it-works"
                className="block text-sm text-navy-600 hover:text-navy-900 py-2"
                onClick={() => setMobileOpen(false)}
              >
                How It Works
              </Link>
              <Link href="/profile" onClick={() => setMobileOpen(false)}>
                <Button size="sm" className="w-full">
                  Start Career Weave
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
