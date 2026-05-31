"use client";

import { useAppSelector } from "@/store/hooks";
import { Opportunity, PathwayCard } from "@/lib/types";
import { ExternalLink, MapPin } from "lucide-react";

const TYPE_LABELS: Record<Opportunity["type"], string> = {
  job: "Job",
  internship: "Internship",
  course: "Course",
  project: "Project",
  mentor: "Mentor",
  challenge: "Challenge",
};

const LEVEL_LABELS: Record<string, string> = {
  entry: "Entry level",
  mid: "Mid level",
  senior: "Senior",
  executive: "Executive",
};

interface Props {
  opportunities: Opportunity[];
  pathways: PathwayCard[];
  recommendedPathwayId: string;
}

export function OpportunitiesPane({ opportunities, pathways, recommendedPathwayId }: Props) {
  const activePathwayId = useAppSelector((s) => s.dashboard.activePathwayId) ?? recommendedPathwayId;
  const activePathway = pathways.find((p) => p.id === activePathwayId);

  const matchedIds = new Set(activePathway?.matchingOpportunities ?? []);

  const primary = opportunities.filter((o) => matchedIds.has(o.id));
  const secondary = opportunities
    .filter((o) => !matchedIds.has(o.id))
    .slice(0, 4);

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-4xl mx-auto">
      <div>
        <h2 className="text-sm font-semibold text-[#0a1628]">Opportunities</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Showing matches for{" "}
          <span className="font-medium text-[#0a1628]">{activePathway?.name ?? "your selected path"}</span>.
          Change your path in Paths to update this view.
        </p>
      </div>

      {primary.length > 0 && (
        <section className="space-y-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Best matches for this path
          </p>
          {primary.map((o) => (
            <OpportunityCard key={o.id} opportunity={o} highlighted />
          ))}
        </section>
      )}

      {secondary.length > 0 && (
        <section className="space-y-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Other opportunities
          </p>
          {secondary.map((o) => (
            <OpportunityCard key={o.id} opportunity={o} highlighted={false} />
          ))}
        </section>
      )}

      {primary.length === 0 && secondary.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-medium text-gray-500">No opportunities found</p>
          <p className="text-xs text-gray-400 mt-1">Try selecting a different path.</p>
        </div>
      )}
    </div>
  );
}

function OpportunityCard({
  opportunity: o,
  highlighted,
}: {
  opportunity: Opportunity;
  highlighted: boolean;
}) {
  return (
    <div
      className={[
        "bg-white rounded-xl border p-4 transition-shadow hover:shadow-sm",
        highlighted ? "border-gray-200" : "border-gray-100",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-medium uppercase tracking-wide">
              {TYPE_LABELS[o.type]}
            </span>
            {o.level && (
              <span className="text-[10px] text-gray-400">{LEVEL_LABELS[o.level]}</span>
            )}
            <span className="text-[10px] font-semibold text-emerald-600">
              {o.matchPercentage}% match
            </span>
          </div>

          <h3 className="text-sm font-semibold text-[#0a1628] truncate">{o.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{o.organization}</p>
        </div>

        {o.externalLink && (
          <a
            href={o.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1 text-xs text-[#4164b4] hover:underline"
          >
            View
            <ExternalLink size={11} />
          </a>
        )}
      </div>

      <p className="text-xs text-gray-600 mt-2 leading-relaxed">{o.description}</p>

      <div className="flex items-center gap-3 mt-3 flex-wrap">
        {o.location && (
          <span className="flex items-center gap-1 text-[11px] text-gray-400">
            <MapPin size={11} />
            {o.location}
          </span>
        )}
        {o.duration && (
          <span className="text-[11px] text-gray-400">{o.duration}</span>
        )}
        {o.salary && (
          <span className="text-[11px] text-gray-500 font-medium">{o.salary}</span>
        )}
      </div>

      {o.skillsDeveloped.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {o.skillsDeveloped.map((skill) => (
            <span
              key={skill}
              className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
