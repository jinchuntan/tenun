"use client";

import { useRouter } from "next/navigation";
import { FlaskConical } from "lucide-react";
import { demoProfileOptions, type DemoProfileId } from "@/lib/demo-profiles";

/**
 * Unobtrusive demo-only control for switching personas. Only rendered when the
 * dashboard is in `?demo=` mode — it is a QA/demo affordance, not product UI.
 * Switching navigates to `/dashboard?demo=<id>`, which the dashboard reloads.
 */
export function DemoPersonaBar({ activeId }: { activeId: DemoProfileId }) {
  const router = useRouter();

  return (
    <div
      data-testid="demo-persona-bar"
      className="fixed bottom-3 left-3 z-50 flex items-center gap-2 rounded-full border border-[#0a1628]/15 bg-white/90 backdrop-blur px-3 py-1.5 shadow-md"
    >
      <FlaskConical size={13} className="text-[#d4a017] shrink-0" aria-hidden="true" />
      <label htmlFor="demo-persona-select" className="text-[11px] font-semibold text-[#0a1628]/60">
        Demo
      </label>
      <select
        id="demo-persona-select"
        aria-label="Switch demo persona"
        value={activeId}
        onChange={(e) => router.replace(`/dashboard?demo=${e.target.value}`)}
        className="bg-transparent text-[11px] font-medium text-[#0a1628] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a017] rounded cursor-pointer"
      >
        {demoProfileOptions.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
