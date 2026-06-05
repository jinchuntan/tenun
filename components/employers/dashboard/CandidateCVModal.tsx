"use client";

import { MapPin, Mail, Phone } from "lucide-react";
import { Modal } from "./Modal";
import type { EmployerCandidate } from "@/lib/employer-candidates";

interface CandidateCVModalProps {
  candidate: EmployerCandidate;
  onClose: () => void;
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-widest text-navy-400 border-b border-beige-200 pb-1 mb-2 mt-4 first:mt-0">
      {children}
    </p>
  );
}

export function CandidateCVModal({ candidate, onClose }: CandidateCVModalProps) {
  return (
    <Modal title={`${candidate.name} — CV`} subtitle={candidate.headline} onClose={onClose}>
      {/* Contact header */}
      <div className="text-center pb-3 border-b border-beige-200">
        <p className="text-xl font-bold text-navy-900">{candidate.name}</p>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1.5 text-[11px] text-navy-500">
          <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{candidate.location}</span>
          <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3" />{candidate.email}</span>
          <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" />{candidate.phone}</span>
        </div>
      </div>

      <Heading>Summary</Heading>
      <p className="text-[13px] text-navy-700 leading-relaxed">{candidate.cvSummary}</p>

      <Heading>Education</Heading>
      {candidate.cv.education.map((ed) => (
        <div key={ed.institution} className="flex justify-between items-baseline gap-3">
          <div>
            <p className="text-[13px] font-semibold text-navy-900">{ed.qualification}</p>
            <p className="text-xs text-navy-500">{ed.institution}{ed.result ? ` · ${ed.result}` : ""}</p>
          </div>
          <p className="text-[11px] text-navy-400 shrink-0">{ed.period}</p>
        </div>
      ))}

      <Heading>Experience</Heading>
      <ul className="space-y-1.5">
        {candidate.cv.experience.map((x) => (
          <li key={x} className="flex items-start gap-2 text-[13px] text-navy-700 leading-snug">
            <span className="mt-1.5 w-1 h-1 rounded-full bg-navy-400 shrink-0" />
            {x}
          </li>
        ))}
      </ul>

      <Heading>Skills</Heading>
      <div className="flex flex-wrap gap-1.5">
        {candidate.cv.skills.map((s) => (
          <span key={s} className="px-2 py-0.5 rounded-full bg-navy-50 text-[11px] font-medium text-navy-700">{s}</span>
        ))}
      </div>

      <Heading>Tools</Heading>
      <div className="flex flex-wrap gap-1.5">
        {candidate.cv.tools.map((t) => (
          <span key={t} className="px-2 py-0.5 rounded-full bg-beige-100 text-[11px] font-medium text-navy-600">{t}</span>
        ))}
      </div>

      <Heading>Projects</Heading>
      <div className="space-y-2">
        {candidate.projects.map((p) => (
          <div key={p.name}>
            <p className="text-[13px] font-semibold text-navy-900">{p.name}</p>
            <p className="text-xs text-navy-600 leading-snug">{p.description}</p>
          </div>
        ))}
      </div>
    </Modal>
  );
}
