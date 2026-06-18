"use client";

import { useState } from "react";
import {
  Building2, BadgeCheck, ShieldCheck, ShieldAlert, Hourglass, Mail, User, FileText, CheckCircle2,
} from "lucide-react";
import { useEmployerWorkspace } from "./EmployerWorkspaceContext";
import { isWorkEmail, isFullyVerified } from "@/lib/employer-company";

export function CompanyProfilePane() {
  const { profile, saveProfile } = useEmployerWorkspace();

  const [companyName, setCompanyName] = useState(profile.companyName);
  const [hiringManager, setHiringManager] = useState(profile.hiringManager);
  const [workEmail, setWorkEmail] = useState(profile.workEmail);
  const [ssmNumber, setSsmNumber] = useState(profile.ssmNumber);
  const [saved, setSaved] = useState(false);

  const emailWouldVerify = isWorkEmail(workEmail);
  const fullyVerified = isFullyVerified(profile);

  function save(e: React.FormEvent) {
    e.preventDefault();
    saveProfile({ companyName, hiringManager, workEmail, ssmNumber });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.8fr] gap-5">
      {/* Form */}
      <form onSubmit={save} className="rounded-3xl border border-beige-300/60 bg-white p-5 space-y-4">
        <div>
          <h2 className="font-display text-2xl text-navy-900 leading-tight">Company profile</h2>
          <p className="text-sm text-navy-500 mt-1">
            Verified employers get higher candidate acceptance. Use your work email for an instant badge.
          </p>
        </div>

        <Field label="Company name" icon={<Building2 className="w-4 h-4" />}>
          <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Acme Technologies Sdn Bhd"
            className="w-full px-3 py-2.5 rounded-xl border border-beige-300 bg-white text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:border-gold-400 focus:ring-4 focus:ring-gold-500/15" />
        </Field>

        <Field label="Hiring manager" icon={<User className="w-4 h-4" />}>
          <input value={hiringManager} onChange={(e) => setHiringManager(e.target.value)} placeholder="Your full name"
            className="w-full px-3 py-2.5 rounded-xl border border-beige-300 bg-white text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:border-gold-400 focus:ring-4 focus:ring-gold-500/15" />
        </Field>

        <Field label="Work email" icon={<Mail className="w-4 h-4" />}>
          <input type="email" value={workEmail} onChange={(e) => setWorkEmail(e.target.value)} placeholder="you@company.com"
            className="w-full px-3 py-2.5 rounded-xl border border-beige-300 bg-white text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:border-gold-400 focus:ring-4 focus:ring-gold-500/15" />
          {workEmail.trim() !== "" && (
            <p className={`text-[11px] mt-1 ${emailWouldVerify ? "text-emerald-600" : "text-navy-400"}`}>
              {emailWouldVerify ? "✓ Company domain — verifies instantly on save" : "A free email (gmail, etc.) won't earn the domain badge"}
            </p>
          )}
        </Field>

        <Field label="SSM registration number" icon={<FileText className="w-4 h-4" />}>
          <input value={ssmNumber} onChange={(e) => setSsmNumber(e.target.value)} placeholder="e.g. 202301012345"
            className="w-full px-3 py-2.5 rounded-xl border border-beige-300 bg-white text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:border-gold-400 focus:ring-4 focus:ring-gold-500/15" />
          <p className="text-[11px] text-navy-400 mt-1">Runs an async verification check after you save.</p>
        </Field>

        <button type="submit" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 text-white text-sm font-bold hover:bg-navy-700 transition-all">
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : "Save profile"}
        </button>
      </form>

      {/* Status card */}
      <div className="rounded-3xl border border-beige-300/60 bg-white p-5 h-fit">
        <h3 className="text-sm font-bold text-navy-900 mb-3">Verification status</h3>

        <div className={[
          "rounded-2xl p-4 mb-4 text-center",
          fullyVerified ? "bg-emerald-50 border border-emerald-200" : "bg-beige-50 border border-beige-300/60",
        ].join(" ")}>
          {fullyVerified ? (
            <>
              <BadgeCheck className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
              <p className="text-sm font-bold text-emerald-700">Verified employer</p>
              <p className="text-[11px] text-emerald-600/80 mt-0.5">{profile.companyName || "Your company"}</p>
            </>
          ) : (
            <>
              <ShieldAlert className="w-8 h-8 text-navy-300 mx-auto mb-1.5" />
              <p className="text-sm font-bold text-navy-700">Not fully verified yet</p>
              <p className="text-[11px] text-navy-400 mt-0.5">Complete the steps below</p>
            </>
          )}
        </div>

        <StatusRow
          label="Work email domain"
          ok={profile.domainVerified}
          okText="Verified"
          pendingText="Add a company email"
        />
        <StatusRow
          label="SSM registration"
          ok={profile.ssmStatus === "verified"}
          pending={profile.ssmStatus === "pending"}
          okText="Verified"
          pendingText={profile.ssmStatus === "pending" ? "Checking…" : "Not submitted"}
        />
      </div>
    </div>
  );
}

function StatusRow({
  label, ok, pending, okText, pendingText,
}: { label: string; ok: boolean; pending?: boolean; okText: string; pendingText: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-t border-beige-200 first:border-0">
      <span className="text-[13px] text-navy-700">{label}</span>
      {ok ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-700">
          <ShieldCheck className="w-3 h-3" /> {okText}
        </span>
      ) : pending ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold-100 text-[11px] font-semibold text-gold-700">
          <Hourglass className="w-3 h-3" /> {pendingText}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-beige-100 text-[11px] font-semibold text-navy-500">
          {pendingText}
        </span>
      )}
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-navy-700 mb-1.5">
        <span className="text-navy-400">{icon}</span> {label}
      </span>
      {children}
    </label>
  );
}
