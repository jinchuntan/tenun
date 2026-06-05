"use client";

import { motion } from "framer-motion";
import { FilePlus2, Sparkles, ListChecks } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const STEP_ICONS = [FilePlus2, Sparkles, ListChecks];

export function EmployerSteps() {
  const { dict } = useLanguage();
  const s = dict.employerSteps;
  const STEPS = s.steps.map((step, i) => ({ ...step, icon: STEP_ICONS[i] }));
  return (
    <section id="how-it-works" className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-gold-600 uppercase tracking-widest mb-2">
            {s.eyebrow}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl text-navy-900 leading-tight">
            {s.titleLine1}
            <br className="hidden sm:block" />{" "}
            {s.titleLine2}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.article
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="rounded-3xl bg-beige-100 border border-beige-300/60 p-7 hover:shadow-lg hover:shadow-navy-900/5 hover:border-gold-300 transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-beige-300/70 shadow-sm">
                    <Icon className="w-5 h-5 text-gold-600" />
                  </span>
                  <span className="font-display text-lg text-navy-300">0{i + 1}</span>
                </div>
                <h3 className="font-bold text-navy-900 text-base mb-2">{step.title}</h3>
                <p className="text-sm text-navy-600 leading-relaxed">{step.body}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
