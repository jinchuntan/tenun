"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface EmployerFormProps {
  roleTitle: string;
}

type Fields = {
  company: string;
  name: string;
  email: string;
  role: string;
  hiringType: string;
  location: string;
  description: string;
};

const EMPTY: Fields = {
  company: "",
  name: "",
  email: "",
  role: "",
  hiringType: "",
  location: "",
  description: "",
};

export function EmployerForm({ roleTitle }: EmployerFormProps) {
  const { dict } = useLanguage();
  const ef = dict.employerForm;
  const HIRING_TYPES = ef.hiringTypes;
  const PRIORITIES = ef.priorities;
  const [fields, setFields] = useState<Fields>(() => ({ ...EMPTY, hiringType: HIRING_TYPES[0] }));
  const [priorities, setPriorities] = useState<string[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Pre-fill the role title when it arrives from the hero search
  useEffect(() => {
    if (roleTitle) setFields((f) => ({ ...f, role: roleTitle }));
  }, [roleTitle]);

  const set = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    setFields((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const togglePriority = (p: string) =>
    setPriorities((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  const validate = (): boolean => {
    const next: Partial<Record<keyof Fields, string>> = {};
    if (!fields.company.trim()) next.company = ef.errCompany;
    if (!fields.name.trim()) next.name = ef.errName;
    if (!fields.email.trim()) next.email = ef.errEmail;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) next.email = ef.errEmailInvalid;
    if (!fields.role.trim()) next.role = ef.errRole;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      // MVP: best-effort submit. We still confirm success even if the endpoint
      // has no datastore yet, so the page never blocks the employer.
      await fetch("/api/employer-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, priorities }),
      });
    } catch {
      /* ignore — MVP capture */
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl border border-beige-300 bg-white text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-400 transition-all";
  const labelCls = "block text-sm font-medium text-navy-800 mb-1.5";

  return (
    <section id="employer-form" className="py-16 md:py-24 bg-beige-100/60 border-y border-beige-300/50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl sm:text-4xl text-navy-900 leading-tight mb-3">
            {ef.title}
          </h2>
          <p className="text-sm sm:text-base text-navy-600 leading-relaxed">
            {ef.subtitle}
          </p>
        </div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-white border border-emerald-200 p-8 text-center shadow-sm"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-navy-900 mb-2">{ef.successTitle}</h3>
            <p className="text-sm text-navy-600 max-w-md mx-auto">
              {ef.successBody}
            </p>
          </motion.div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="rounded-3xl bg-white border border-beige-300/60 p-6 sm:p-8 shadow-sm space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls} htmlFor="ef-company">{ef.company} *</label>
                <input id="ef-company" className={inputCls} value={fields.company}
                  onChange={(e) => set("company", e.target.value)} placeholder={ef.companyPlaceholder} />
                {errors.company && <p className="text-xs text-red-600 mt-1">{errors.company}</p>}
              </div>
              <div>
                <label className={labelCls} htmlFor="ef-name">{ef.name} *</label>
                <input id="ef-name" className={inputCls} value={fields.name}
                  onChange={(e) => set("name", e.target.value)} placeholder={ef.namePlaceholder} />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls} htmlFor="ef-email">{ef.email} *</label>
                <input id="ef-email" type="email" className={inputCls} value={fields.email}
                  onChange={(e) => set("email", e.target.value)} placeholder={ef.emailPlaceholder} />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className={labelCls} htmlFor="ef-role">{ef.role} *</label>
                <input id="ef-role" className={inputCls} value={fields.role}
                  onChange={(e) => set("role", e.target.value)} placeholder={ef.rolePlaceholder} />
                {errors.role && <p className="text-xs text-red-600 mt-1">{errors.role}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls} htmlFor="ef-type">{ef.hiringTypeLabel}</label>
                <select id="ef-type" className={inputCls} value={fields.hiringType}
                  onChange={(e) => set("hiringType", e.target.value)}>
                  {HIRING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="ef-location">{ef.location}</label>
                <input id="ef-location" className={inputCls} value={fields.location}
                  onChange={(e) => set("location", e.target.value)} placeholder={ef.locationPlaceholder} />
              </div>
            </div>

            <div>
              <label className={labelCls} htmlFor="ef-desc">{ef.description}</label>
              <textarea id="ef-desc" rows={3} className={`${inputCls} resize-none`} value={fields.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder={ef.descriptionPlaceholder} />
            </div>

            <div>
              <span className={labelCls}>{ef.prioritiesLabel}</span>
              <div className="flex flex-wrap gap-2">
                {PRIORITIES.map((p) => {
                  const active = priorities.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePriority(p)}
                      aria-pressed={active}
                      className={[
                        "px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all",
                        active
                          ? "bg-navy-900 text-white border-navy-900"
                          : "bg-white text-navy-600 border-beige-300 hover:border-navy-400",
                      ].join(" ")}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gold-500 text-navy-900 text-sm font-bold hover:bg-gold-400 disabled:opacity-60 transition-all shadow-lg shadow-gold-500/20"
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> {ef.submitting}</> : ef.submit}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
