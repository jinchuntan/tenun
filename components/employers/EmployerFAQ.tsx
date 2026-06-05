"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

function FAQItem({
  item, isOpen, onToggle,
}: {
  item: { q: string; a: string };
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-2xl bg-beige-100 border border-beige-300/60 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 text-left px-5 py-4"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-navy-900 text-sm">{item.q}</span>
        <ChevronDown
          className={`w-4 h-4 text-navy-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm text-navy-600 leading-relaxed">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function EmployerFAQ() {
  const { dict } = useLanguage();
  const FAQ_ITEMS = dict.employerFaq.items;
  const [open, setOpen] = useState<Set<number>>(new Set([0]));

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const mid = Math.ceil(FAQ_ITEMS.length / 2);
  const columns = [
    FAQ_ITEMS.slice(0, mid).map((item, i) => ({ item, index: i })),
    FAQ_ITEMS.slice(mid).map((item, i) => ({ item, index: i + mid })),
  ];

  return (
    <section id="employer-faq" className="py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-gold-600 uppercase tracking-widest mb-2">{dict.employerFaq.eyebrow}</p>
          <h2 className="font-display text-3xl sm:text-4xl text-navy-900">
            {dict.employerFaq.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {columns.map((col, ci) => (
            <div key={ci} className="space-y-4">
              {col.map(({ item, index }) => (
                <FAQItem
                  key={item.q}
                  item={item}
                  isOpen={open.has(index)}
                  onToggle={() => toggle(index)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
