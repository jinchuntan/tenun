"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Workflow, Briefcase, Globe } from "lucide-react";

interface MenuColumn {
  heading: string;
  icon: React.ReactNode;
  links: { label: string; href: string }[];
}

const COLUMNS: MenuColumn[] = [
  {
    heading: "Career Weave",
    icon: <Workflow className="w-5 h-5 text-navy-800" />,
    links: [
      { label: "Draft My Portfolio", href: "/profile?upload=true&from=landing" },
      { label: "Connect to A Mentor", href: "/dashboard#section-mentors" },
      { label: "My Skills Gap Plan", href: "/dashboard#section-skills" },
    ],
  },
  {
    heading: "Job",
    icon: <Briefcase className="w-5 h-5 text-navy-800" />,
    links: [
      { label: "Find A Job", href: "/#hero-search" },
      { label: "Career Matching", href: "/#hero-search" },
      { label: "Interview Lab", href: "/dashboard#section-outreach" },
    ],
  },
  {
    heading: "Projects",
    icon: <Globe className="w-5 h-5 text-navy-800" />,
    links: [
      { label: "Explore others", href: "/dashboard#section-atlas" },
      { label: "Saved Projects", href: "/dashboard" },
    ],
  },
];

export function WeaverMegaMenu({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      className="rounded-3xl bg-beige-100 border border-beige-300/70 shadow-xl shadow-navy-900/5 p-6 sm:p-8"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10">
        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-beige-300/80 shadow-sm">
                {col.icon}
              </span>
              <h3 className="text-base font-bold text-navy-900">{col.heading}</h3>
            </div>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={onNavigate}
                    className="block text-sm text-navy-600 hover:text-navy-900 hover:translate-x-0.5 transition-all"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
