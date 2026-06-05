"use client";

import { CalendarClock, Check } from "lucide-react";
import { Modal } from "./Modal";
import type { EmployerCandidate } from "@/lib/employer-candidates";

interface MeetingModalProps {
  candidate: EmployerCandidate;
  selectedSlotId: string | null;
  onSelectSlot: (slotId: string, slotLabel: string) => void;
  onClose: () => void;
}

export function MeetingModal({ candidate, selectedSlotId, onSelectSlot, onClose }: MeetingModalProps) {
  return (
    <Modal
      title={`Book a meeting with ${candidate.name.split(" ")[0]}`}
      subtitle="Pick a slot — this is a prototype, nothing is actually scheduled."
      onClose={onClose}
      footer={
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-navy-900 text-white text-sm font-semibold hover:bg-navy-800 transition-colors"
        >
          Done
        </button>
      }
    >
      <div className="space-y-2.5">
        {candidate.meetingSlots.map((slot) => {
          const active = slot.id === selectedSlotId;
          return (
            <button
              key={slot.id}
              onClick={() => onSelectSlot(slot.id, slot.label)}
              className={[
                "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all text-left",
                active
                  ? "border-gold-400 bg-gold-50 ring-2 ring-gold-400/30"
                  : "border-beige-300/70 bg-white hover:border-gold-300",
              ].join(" ")}
            >
              <span className="inline-flex items-center gap-2.5">
                <CalendarClock className={active ? "w-4 h-4 text-gold-600" : "w-4 h-4 text-navy-400"} />
                <span className="text-sm font-medium text-navy-900">{slot.label}</span>
              </span>
              {active && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700">
                  <Check className="w-4 h-4" /> Selected
                </span>
              )}
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
