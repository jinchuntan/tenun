"use client";

import { useState } from "react";
import {
  Plus, MapPin, Wallet, Trash2, Star, CheckCircle2, Users, X, Briefcase,
} from "lucide-react";
import {
  ROLE_LEVELS, WORK_MODES, ROLE_STAGES, salaryLabel,
  type RoleDraft, type RoleLevel, type WorkMode, type RoleStage, type EmployerRole,
} from "@/lib/employer-roles";
import { SkillTagInput } from "./SkillTagInput";
import { useEmployerWorkspace } from "./EmployerWorkspaceContext";

const EMPTY: RoleDraft = {
  title: "", level: "Entry", location: "", workMode: "On-site",
  mustHaveSkills: [], niceToHaveSkills: [], context: "",
};

const STAGE_HINT: Record<RoleStage, string> = {
  Posted: "Live and visible",
  Reviewing: "Shortlisting candidates",
  Contacted: "Reached out to connect",
  Interviewing: "In interviews",
};

export function JobPostingsPane({ onViewCandidates }: { onViewCandidates: () => void }) {
  const { roles, activeRoleId, addRole, deleteRole, setStage, setActiveRoleId } = useEmployerWorkspace();
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState<RoleDraft>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof RoleDraft>(key: K, val: RoleDraft[K]) {
    setDraft((d) => ({ ...d, [key]: val }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.title.trim()) {
      setError("Give the role a title.");
      return;
    }
    if (draft.mustHaveSkills.length === 0) {
      setError("Add at least one must-have skill — it powers candidate matching.");
      return;
    }
    addRole({ ...draft, title: draft.title.trim() });
    setDraft(EMPTY);
    setShowForm(false);
    setError(null);
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display text-2xl text-navy-900 leading-tight">Job postings</h2>
          <p className="text-sm text-navy-500 mt-1 max-w-2xl">
            Post a structured role. Your must-have skills power the Best-fit candidates view and the JD comparison.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setError(null); }}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-500 text-navy-900 text-sm font-bold hover:bg-gold-400 transition-all"
          >
            <Plus className="w-4 h-4" /> Post a role
          </button>
        )}
      </div>

      {/* Role form */}
      {showForm && (
        <form onSubmit={submit} className="rounded-3xl border border-beige-300/60 bg-white p-5 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900">New role</h3>
            <button type="button" onClick={() => { setShowForm(false); setError(null); }} className="text-navy-400 hover:text-navy-700">
              <X className="w-4 h-4" />
            </button>
          </div>

          <Field label="Role title">
            <input
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Backend Software Engineer Intern"
              className="w-full px-3 py-2.5 rounded-xl border border-beige-300 bg-white text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:border-gold-400 focus:ring-4 focus:ring-gold-500/15"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Level">
              <Select value={draft.level} options={ROLE_LEVELS} onChange={(v) => set("level", v as RoleLevel)} />
            </Field>
            <Field label="Work mode">
              <Select value={draft.workMode} options={WORK_MODES} onChange={(v) => set("workMode", v as WorkMode)} />
            </Field>
            <Field label="Location">
              <input
                value={draft.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="e.g. Kuala Lumpur"
                className="w-full px-3 py-2.5 rounded-xl border border-beige-300 bg-white text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:border-gold-400 focus:ring-4 focus:ring-gold-500/15"
              />
            </Field>
          </div>

          <Field label="Must-have skills">
            <SkillTagInput value={draft.mustHaveSkills} onChange={(v) => set("mustHaveSkills", v)} accent="emerald" placeholder="Type a skill, press Enter" />
          </Field>
          <Field label="Nice-to-have skills">
            <SkillTagInput value={draft.niceToHaveSkills} onChange={(v) => set("niceToHaveSkills", v)} accent="navy" placeholder="Optional — press Enter to add" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Salary min (RM/month)">
              <input
                type="number" min={0} value={draft.salaryMin ?? ""}
                onChange={(e) => set("salaryMin", e.target.value ? Number(e.target.value) : undefined)}
                placeholder="3000"
                className="w-full px-3 py-2.5 rounded-xl border border-beige-300 bg-white text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:border-gold-400 focus:ring-4 focus:ring-gold-500/15"
              />
            </Field>
            <Field label="Salary max (RM/month)">
              <input
                type="number" min={0} value={draft.salaryMax ?? ""}
                onChange={(e) => set("salaryMax", e.target.value ? Number(e.target.value) : undefined)}
                placeholder="4000"
                className="w-full px-3 py-2.5 rounded-xl border border-beige-300 bg-white text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:border-gold-400 focus:ring-4 focus:ring-gold-500/15"
              />
            </Field>
          </div>

          <Field label="Role context">
            <textarea
              value={draft.context}
              onChange={(e) => set("context", e.target.value)}
              rows={3}
              placeholder="A sentence or two on the team, what they'll work on, and what good looks like."
              className="w-full px-3 py-2.5 rounded-xl border border-beige-300 bg-white text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:border-gold-400 focus:ring-4 focus:ring-gold-500/15 resize-y"
            />
          </Field>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-2">
            <button type="submit" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 text-white text-sm font-bold hover:bg-navy-700 transition-all">
              <CheckCircle2 className="w-4 h-4" /> Post role
            </button>
            <button type="button" onClick={() => { setShowForm(false); setError(null); }} className="px-4 py-2.5 rounded-xl border border-navy-200 text-navy-700 text-sm font-semibold hover:bg-navy-50">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Roles list */}
      {roles.length === 0 && !showForm ? (
        <div className="rounded-3xl border border-dashed border-beige-300 bg-white/60 p-10 text-center">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-navy-50 text-navy-700 mb-4">
            <Briefcase className="w-6 h-6" />
          </span>
          <h3 className="font-display text-xl text-navy-900">No roles yet</h3>
          <p className="text-sm text-navy-500 mt-1.5 max-w-md mx-auto">Post your first role to start matching candidates by evidence.</p>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl bg-gold-500 text-navy-900 text-sm font-bold hover:bg-gold-400 transition-all">
            <Plus className="w-4 h-4" /> Post a role
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {roles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              active={role.id === activeRoleId}
              onSetActive={() => setActiveRoleId(role.id)}
              onSetStage={(s) => setStage(role.id, s)}
              onDelete={() => deleteRole(role.id)}
              onViewCandidates={() => { setActiveRoleId(role.id); onViewCandidates(); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RoleCard({
  role, active, onSetActive, onSetStage, onDelete, onViewCandidates,
}: {
  role: EmployerRole;
  active: boolean;
  onSetActive: () => void;
  onSetStage: (s: RoleStage) => void;
  onDelete: () => void;
  onViewCandidates: () => void;
}) {
  const salary = salaryLabel(role);
  return (
    <div className={["rounded-2xl border bg-white p-4", active ? "border-gold-400 ring-2 ring-gold-400/30" : "border-beige-300/60"].join(" ")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-navy-900">{role.title}</h3>
            <span className="px-2 py-0.5 rounded-full bg-navy-50 text-[11px] font-semibold text-navy-700">{role.level}</span>
            {active && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold-50 border border-gold-200 text-[11px] font-semibold text-gold-700">
                <Star className="w-3 h-3" /> Active
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[12px] text-navy-500">
            <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {role.location || "—"} · {role.workMode}</span>
            {salary && <span className="inline-flex items-center gap-1"><Wallet className="w-3.5 h-3.5" /> {salary}</span>}
          </div>
        </div>
        <button onClick={onDelete} className="shrink-0 text-navy-300 hover:text-red-500 transition-colors" aria-label="Delete role">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {role.mustHaveSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {role.mustHaveSkills.map((s) => (
            <span key={s} className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-medium text-emerald-700">{s}</span>
          ))}
          {role.niceToHaveSkills.map((s) => (
            <span key={s} className="px-2 py-0.5 rounded-full bg-beige-100 text-[11px] font-medium text-navy-600">{s}</span>
          ))}
        </div>
      )}

      {role.context && <p className="text-[13px] text-navy-600 leading-relaxed mt-2.5">{role.context}</p>}

      {/* Pipeline */}
      <div className="mt-3.5">
        <p className="text-[11px] font-semibold text-navy-400 uppercase tracking-wide mb-1.5">Pipeline · {STAGE_HINT[role.stage]}</p>
        <div className="flex flex-wrap gap-1.5">
          {ROLE_STAGES.map((s) => {
            const on = s === role.stage;
            return (
              <button
                key={s}
                onClick={() => onSetStage(s)}
                className={[
                  "px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all",
                  on ? "bg-navy-900 text-white" : "bg-beige-100 text-navy-600 hover:bg-beige-200",
                ].join(" ")}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-beige-200">
        <button
          onClick={onViewCandidates}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500 text-navy-900 text-[12px] font-bold hover:bg-gold-400 transition-all"
        >
          <Users className="w-3.5 h-3.5" /> View best-fit candidates
        </button>
        {!active && (
          <button
            onClick={onSetActive}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-navy-200 text-navy-700 text-[12px] font-semibold hover:bg-navy-50 transition-all"
          >
            <Star className="w-3.5 h-3.5" /> Make active
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-navy-700 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function Select({ value, options, onChange }: { value: string; options: readonly string[]; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 rounded-xl border border-beige-300 bg-white text-sm text-navy-900 focus:outline-none focus:border-gold-400 focus:ring-4 focus:ring-gold-500/15"
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
