"use client";

import { useState } from "react";
import {
  Trophy, Award, Users as UsersIcon, FileText, UserPlus, Hourglass, Check, X, MapPin,
} from "lucide-react";
import { CandidateCVModal } from "./CandidateCVModal";
import { useEmployerWorkspace } from "./EmployerWorkspaceContext";
import {
  curatedTopCandidates, provenSkills, buildCandidateCvText,
  type EmployerCandidate, type ConnectionStatus,
} from "@/lib/employer-candidates";

function downloadCv(c: EmployerCandidate) {
  const blob = new Blob([buildCandidateCvText(c)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${c.name.replace(/\s+/g, "_")}_CV.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function TopCandidatesPane() {
  const { connections, requestConnect } = useEmployerWorkspace();
  const [cvFor, setCvFor] = useState<EmployerCandidate | null>(null);

  const top = curatedTopCandidates(10);
  const [spotlight, ...rest] = top;

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-display text-2xl text-navy-900 leading-tight flex items-center gap-2">
          <Trophy className="w-6 h-6 text-gold-600" /> Top candidates this month
        </h2>
        <p className="text-sm text-navy-500 mt-1 max-w-2xl">
          A curated highlight reel of the strongest early-career talent on Tenun right now —
          ordered by proof, never by score.
        </p>
      </div>

      {/* Spotlight */}
      {spotlight && (
        <div className="rounded-3xl border border-gold-300 bg-gradient-to-br from-gold-50 to-white p-5 mb-5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold-500 text-navy-900 text-[11px] font-bold mb-3">
            <Award className="w-3.5 h-3.5" /> Spotlight of the month
          </span>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-navy-900 text-white text-lg font-bold flex items-center justify-center shrink-0">
              {spotlight.initials}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-navy-900">{spotlight.name}</h3>
              <p className="text-xs text-navy-500">{spotlight.headline}</p>
              <p className="text-[13px] text-navy-700 leading-snug mt-2">{spotlight.evidencedClaim}</p>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {provenSkills(spotlight).slice(0, 6).map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded-full bg-white border border-gold-200 text-[11px] font-medium text-navy-700">{s}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <ConnectButton connection={connections[spotlight.id] ?? "none"} onClick={() => requestConnect(spotlight.id)} />
            <button onClick={() => setCvFor(spotlight)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-navy-200 text-navy-700 text-[12px] font-semibold hover:bg-navy-50">
              <FileText className="w-3.5 h-3.5" /> View CV
            </button>
          </div>
        </div>
      )}

      {/* The rest */}
      <div className="space-y-3">
        {rest.map((c) => {
          const proof = c.socialProof[0] ?? c.credentials[0];
          return (
            <div key={c.id} className="rounded-2xl border border-beige-300/60 bg-white p-4 flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-navy-900 text-white text-sm font-bold flex items-center justify-center shrink-0">
                {c.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-navy-900">{c.name}</p>
                <p className="text-[13px] text-navy-700 leading-snug mt-0.5">{c.evidencedClaim}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {provenSkills(c).slice(0, 4).map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-full bg-beige-100 text-[11px] font-medium text-navy-700">{s}</span>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-navy-500">
                  <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.location}</span>
                  {proof && <span className="inline-flex items-center gap-1"><Award className="w-3 h-3 text-gold-500" /> {proof}</span>}
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1.5">
                <ConnectButton connection={connections[c.id] ?? "none"} onClick={() => requestConnect(c.id)} />
                <button onClick={() => setCvFor(c)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-navy-200 text-navy-700 text-[11px] font-semibold hover:bg-navy-50">
                  <FileText className="w-3 h-3" /> CV
                </button>
                <button onClick={() => downloadCv(c)} className="text-[11px] text-navy-400 hover:text-navy-700 underline underline-offset-2">Download</button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-navy-400 mt-4 flex items-center gap-1.5">
        <UsersIcon className="w-3.5 h-3.5" /> Curated demo data · fictional candidates.
      </p>

      {cvFor && <CandidateCVModal candidate={cvFor} onClose={() => setCvFor(null)} />}
    </div>
  );
}

function ConnectButton({
  connection, onClick,
}: { connection: ConnectionStatus; onClick: () => void }) {
  const base = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all";
  if (connection === "accepted") return <span className={`${base} bg-emerald-600 text-white`}><Check className="w-3.5 h-3.5" /> Connected</span>;
  if (connection === "declined") return <span className={`${base} bg-navy-100 text-navy-500`}><X className="w-3.5 h-3.5" /> Declined</span>;
  if (connection === "pending") return <span className={`${base} bg-gold-100 text-gold-700`}><Hourglass className="w-3.5 h-3.5" /> Pending</span>;
  return (
    <button type="button" onClick={onClick} className={`${base} bg-gold-500 text-navy-900 hover:bg-gold-400`}>
      <UserPlus className="w-3.5 h-3.5" /> Request to connect
    </button>
  );
}
