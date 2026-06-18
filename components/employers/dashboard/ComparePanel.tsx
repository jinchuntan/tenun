"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeftRight, Check, X, FolderGit2, Target, Sparkles,
  Briefcase, MapPin, Wallet, Star,
} from "lucide-react";
import type { EmployerCandidate } from "@/lib/employer-candidates";
import { type EmployerRole, salaryLabel } from "@/lib/employer-roles";
import {
  evaluateSkill, mustHaveMet, matchingProjects, skillFitsRole, extraSkills,
} from "@/lib/jd-match";

interface ComparePanelProps {
  role: EmployerRole;
  candidate: EmployerCandidate;
  onClose: () => void;
}

// Slide each half in from its own side so the two come together into the table.
const COL_SPRING = { type: "spring", stiffness: 320, damping: 30 } as const;

export function ComparePanel({ role, candidate, onClose }: ComparePanelProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Smooth-scroll the comparison into view once it has expanded.
  useEffect(() => {
    const t = setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 220);
    return () => clearTimeout(t);
  }, []);

  const met = mustHaveMet(role, candidate);
  const total = role.mustHaveSkills.length;
  const fits = matchingProjects(role, candidate);
  const extras = extraSkills(role, candidate).slice(0, 8);
  const salary = salaryLabel(role);

  return (
    <motion.div
      ref={ref}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden border-t border-beige-200 bg-beige-50/50"
    >
      <div className="p-4 sm:p-5">
        {/* Panel header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-navy-800">
              <ArrowLeftRight className="w-4 h-4 text-navy-500 shrink-0" />
              <p className="text-sm font-bold truncate">
                {candidate.name} <span className="text-navy-400 font-medium">vs</span> {role.title}
              </p>
            </div>
            <p className="text-[12px] mt-1">
              <span className="font-semibold text-emerald-700">{met}</span>
              <span className="text-navy-500"> of {total} must-have skill{total === 1 ? "" : "s"} evidenced</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-navy-200 text-navy-600 text-[11px] font-bold hover:bg-navy-50 transition-all"
          >
            <X className="w-3 h-3" /> Close compare
          </button>
        </div>

        {/* Two-side table: candidate ← | → role */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Candidate side */}
          <motion.div
            initial={{ x: -24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ ...COL_SPRING, delay: 0.12 }}
            className="rounded-2xl border border-beige-300/60 bg-white p-4"
          >
            <ColumnHeader
              eyebrow="Candidate"
              title={candidate.name}
              subtitle={candidate.headline}
              accent="navy"
            />

            <p className="text-[12px] text-navy-600 leading-snug mt-3">{candidate.evidencedClaim}</p>

            <SubLabel className="mt-4">Skills · <span className="text-emerald-700">green = fits this role</span></SubLabel>
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.map((s) => {
                const fit = skillFitsRole(s, role);
                return (
                  <span
                    key={s}
                    className={[
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium",
                      fit
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                        : "bg-beige-100 text-navy-600",
                    ].join(" ")}
                  >
                    {fit && <Check className="w-3 h-3" />}{s}
                  </span>
                );
              })}
            </div>

            {/* Special projects that benefit this role */}
            <SubLabel className="mt-4">
              <Star className="w-3 h-3 text-gold-600" /> Projects that fit this role
            </SubLabel>
            {fits.length === 0 ? (
              <p className="text-[12px] text-navy-400 leading-snug">
                No project directly evidences this role&rsquo;s skills yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {fits.map(({ project, proves }) => (
                  <div key={project.name} className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[13px] font-bold text-navy-900 inline-flex items-center gap-1.5">
                        <FolderGit2 className="w-3.5 h-3.5 text-navy-500" /> {project.name}
                      </p>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shrink-0">
                        <Check className="w-2.5 h-2.5" /> Fits
                      </span>
                    </div>
                    <p className="text-[11px] text-navy-600 mt-1 leading-snug">{project.description}</p>
                    <div className="flex flex-wrap items-center gap-1 mt-1.5">
                      <span className="text-[10px] font-semibold text-navy-400 uppercase tracking-wide mr-0.5">Proves</span>
                      {proves.map((p) => (
                        <span key={p} className="px-1.5 py-0.5 rounded-full bg-white border border-emerald-200 text-[10px] font-semibold text-emerald-700">
                          {p}
                        </span>
                      ))}
                    </div>
                    <p className="flex items-start gap-1.5 text-[11px] text-emerald-700 mt-1.5 leading-snug">
                      <Target className="w-3 h-3 mt-0.5 shrink-0" /> {project.outcome}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {extras.length > 0 && (
              <>
                <SubLabel className="mt-4">Also brings (beyond the JD)</SubLabel>
                <div className="flex flex-wrap gap-1.5">
                  {extras.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-full bg-beige-100 text-[11px] font-medium text-navy-600">{s}</span>
                  ))}
                </div>
              </>
            )}
          </motion.div>

          {/* Role / JD side */}
          <motion.div
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ ...COL_SPRING, delay: 0.12 }}
            className="rounded-2xl border border-navy-100 bg-navy-50/40 p-4"
          >
            <ColumnHeader
              eyebrow="Your role"
              title={role.title}
              subtitle={`${role.level} · ${role.workMode}`}
              accent="gold"
            />

            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px] text-navy-500">
              <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {role.location || "—"}</span>
              {salary && <span className="inline-flex items-center gap-1"><Wallet className="w-3 h-3" /> {salary}</span>}
            </div>

            <SubLabel className="mt-4">Must-have skills</SubLabel>
            {role.mustHaveSkills.length === 0 ? (
              <p className="text-[12px] text-navy-400">No must-have skills listed.</p>
            ) : (
              <div className="space-y-1.5">
                {role.mustHaveSkills.map((s) => <JdSkillRow key={s} skill={s} candidate={candidate} />)}
              </div>
            )}

            {role.niceToHaveSkills.length > 0 && (
              <>
                <SubLabel className="mt-4">Nice-to-have skills</SubLabel>
                <div className="space-y-1.5">
                  {role.niceToHaveSkills.map((s) => <JdSkillRow key={s} skill={s} candidate={candidate} />)}
                </div>
              </>
            )}

            {role.context && (
              <>
                <SubLabel className="mt-4"><Briefcase className="w-3 h-3" /> Role context</SubLabel>
                <p className="text-[12px] text-navy-600 leading-relaxed">{role.context}</p>
              </>
            )}
          </motion.div>
        </div>

        <p className="text-[10px] text-navy-400 mt-3">
          Matched against the candidate&rsquo;s evidenced projects and declared skills — no scores.
        </p>
      </div>
    </motion.div>
  );
}

/** One JD skill, green when the candidate evidences it, grey "not shown" otherwise. */
function JdSkillRow({ skill, candidate }: { skill: string; candidate: EmployerCandidate }) {
  const { met, project } = evaluateSkill(skill, candidate);
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 bg-white border border-beige-200">
      <span className="text-[12px] font-medium text-navy-800 truncate">{skill}</span>
      <div className="flex items-center gap-1.5 shrink-0">
        {met && project && (
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-navy-400">
            <FolderGit2 className="w-3 h-3" /> {project.name}
          </span>
        )}
        {met ? (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">
            <Check className="w-2.5 h-2.5" /> Has it
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-beige-100 text-[10px] font-semibold text-navy-400">
            <X className="w-2.5 h-2.5" /> Not shown
          </span>
        )}
      </div>
    </div>
  );
}

function ColumnHeader({
  eyebrow, title, subtitle, accent,
}: { eyebrow: string; title: string; subtitle: string; accent: "navy" | "gold" }) {
  return (
    <div>
      <span
        className={[
          "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest",
          accent === "gold" ? "text-gold-600" : "text-navy-400",
        ].join(" ")}
      >
        <Sparkles className="w-3 h-3" /> {eyebrow}
      </span>
      <h4 className="text-base font-bold text-navy-900 leading-tight mt-1">{title}</h4>
      <p className="text-[12px] text-navy-500 leading-snug">{subtitle}</p>
    </div>
  );
}

function SubLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-navy-400 mb-1.5 ${className}`}>
      {children}
    </p>
  );
}
