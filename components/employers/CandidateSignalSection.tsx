"use client";

import { motion } from "framer-motion";
import { Target, FolderGit2, TrendingUp, MessageSquare, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const CARD_ICONS = [Target, FolderGit2, TrendingUp, MessageSquare, CheckCircle2];

export function CandidateSignalSection() {
  const { dict } = useLanguage();
  const c = dict.candidateSignal;
  const CARDS = c.cards.map((card, i) => ({ ...card, icon: CARD_ICONS[i] }));
  return (
    <section id="candidate-signal" className="py-16 md:py-24 bg-beige-100/60 border-y border-beige-300/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl text-navy-900 leading-tight mb-3">
            {c.titleLine1}
            <br className="hidden sm:block" />{" "}
            {c.titleLine2}
          </h2>
          <p className="text-sm sm:text-base text-navy-600 leading-relaxed">
            {c.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.article
                key={card.badge}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                whileHover={{
                  scale: 1.05,
                  y: -12,
                  zIndex: 10,
                  transition: { type: "spring", stiffness: 300, damping: 20 },
                }}
                className="relative rounded-3xl bg-white border border-beige-300/60 p-5 shadow-sm hover:shadow-xl hover:shadow-navy-900/10 hover:border-gold-400 transition-shadow"
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gold-50 border border-gold-200 mb-4">
                  <Icon className="w-5 h-5 text-gold-600" />
                </span>
                <p className="font-bold text-navy-900 text-sm mb-2">{card.badge}</p>
                <p className="text-xs text-navy-600 leading-relaxed">{card.body}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
