"use client";

import { useState } from "react";
import { Copy, Check, Send, CalendarClock } from "lucide-react";
import { Modal } from "./Modal";
import { buildIntroMessage, type EmployerCandidate } from "@/lib/employer-candidates";

interface MessageModalProps {
  candidate: EmployerCandidate;
  role: string;
  selectedSlotLabel: string | null;
  sent: boolean;
  onMarkSent: () => void;
  onClose: () => void;
}

export function MessageModal({
  candidate, role, selectedSlotLabel, sent, onMarkSent, onClose,
}: MessageModalProps) {
  const [copied, setCopied] = useState(false);
  const message = buildIntroMessage(candidate, role, selectedSlotLabel);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — ignore in prototype */
    }
  };

  return (
    <Modal
      title="WhatsApp intro preview"
      subtitle={`To ${candidate.name} · ${candidate.phone}`}
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-navy-200 text-navy-800 text-sm font-semibold hover:border-navy-900 hover:bg-navy-50 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied" : "Copy message"}
          </button>
          <button
            onClick={onMarkSent}
            disabled={sent}
            className={[
              "flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all",
              sent
                ? "bg-emerald-600 text-white cursor-default"
                : "bg-gold-500 text-navy-900 hover:bg-gold-400",
            ].join(" ")}
          >
            {sent ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            {sent ? "Intro sent" : "Mark as sent"}
          </button>
        </div>
      }
    >
      {selectedSlotLabel && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-medium text-emerald-700 mb-3">
          <CalendarClock className="w-4 h-4" /> Proposing: {selectedSlotLabel}
        </div>
      )}

      {/* WhatsApp-style bubble */}
      <div className="rounded-2xl bg-[#e7f6e7] border border-emerald-200 p-3.5">
        <p className="text-[13px] text-navy-800 leading-relaxed whitespace-pre-wrap">{message}</p>
        <p className="text-[10px] text-navy-400 text-right mt-2">Simulated preview · not sent</p>
      </div>

      <p className="text-[11px] text-navy-400 mt-3">
        This is a prototype. No message is sent to any real number or WhatsApp account.
      </p>
    </Modal>
  );
}
