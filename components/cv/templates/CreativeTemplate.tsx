import type { CVBlock } from "@/lib/cv-types";

const ACCENT = "#6c5ce7";

function str(block: CVBlock, key: string): string {
  return (block.content[key] as string) ?? "";
}
function arr(block: CVBlock, key: string): string[] {
  return (block.content[key] as string[]) ?? [];
}

function SideHeading({ label }: { label: string }) {
  return <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: ACCENT }}>{label}</p>;
}

function MainHeading({ label }: { label: string }) {
  return (
    <div className="mb-2 mt-4 first:mt-0">
      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: ACCENT }}>{label}</p>
      <div className="h-px mt-0.5" style={{ backgroundColor: ACCENT + "40" }} />
    </div>
  );
}

export function CreativeTemplate({ blocks, allIds }: { blocks: Record<string, CVBlock>; allIds: string[] }) {
  const orderedBlocks = allIds.map((id) => blocks[id]).filter(Boolean);

  const infoBlock = orderedBlocks.find((b) => b.type === "personal_info");
  const sideBlocks = orderedBlocks.filter((b) =>
    ["skills", "certifications", "portfolio"].includes(b.type)
  );
  const mainBlocks = orderedBlocks.filter((b) =>
    !["personal_info", "skills", "certifications", "portfolio"].includes(b.type)
  );

  return (
    <div className="w-full bg-white text-[#0a1628] min-h-[1056px] flex flex-col" style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      {infoBlock && (
        <div className="px-8 py-5" style={{ backgroundColor: ACCENT }}>
          <p className="text-2xl font-bold text-white leading-tight">{str(infoBlock, "name") || "Your Name"}</p>
          <div className="flex flex-wrap gap-x-3 mt-1 text-[10px] text-white/70">
            {str(infoBlock, "email") && <span>{str(infoBlock, "email")}</span>}
            {str(infoBlock, "phone") && <span>{str(infoBlock, "phone")}</span>}
            {str(infoBlock, "location") && <span>{str(infoBlock, "location")}</span>}
            {str(infoBlock, "linkedin") && <span>{str(infoBlock, "linkedin")}</span>}
            {str(infoBlock, "website") && <span>{str(infoBlock, "website")}</span>}
          </div>
        </div>
      )}

      {/* Body: sidebar + main */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-44 shrink-0 bg-gray-50 border-r border-gray-100 px-4 py-5 space-y-4">
          {sideBlocks.map((block) => {
            switch (block.type) {
              case "skills":
                return arr(block, "items").length > 0 ? (
                  <div key={block.id}>
                    <SideHeading label="Skills" />
                    <div className="flex flex-col gap-1">
                      {arr(block, "items").map((s) => (
                        <span key={s} className="text-[10px] text-gray-600">{s}</span>
                      ))}
                    </div>
                  </div>
                ) : null;

              case "certifications":
                return str(block, "name") ? (
                  <div key={block.id}>
                    <SideHeading label="Certifications" />
                    <p className="text-[10px] font-medium text-[#0a1628]">{str(block, "name")}</p>
                    <p className="text-[9.5px] text-gray-400">{str(block, "issuer")}</p>
                    <p className="text-[9.5px] text-gray-400">{str(block, "date")}</p>
                  </div>
                ) : null;

              case "portfolio":
                return str(block, "title") ? (
                  <div key={block.id}>
                    <SideHeading label="Portfolio" />
                    <p className="text-[10px] font-medium text-[#0a1628]">{str(block, "title")}</p>
                    {str(block, "url") && <p className="text-[9.5px]" style={{ color: ACCENT }}>{str(block, "url")}</p>}
                  </div>
                ) : null;

              default:
                return null;
            }
          })}
        </div>

        {/* Main content */}
        <div className="flex-1 px-6 py-5">
          {mainBlocks.map((block) => {
            switch (block.type) {
              case "summary":
                return str(block, "text") ? (
                  <div key={block.id}>
                    <MainHeading label="Summary" />
                    <p className="text-[10.5px] text-gray-700 leading-relaxed">{str(block, "text")}</p>
                  </div>
                ) : null;

              case "work_experience":
                return str(block, "company") || str(block, "role") ? (
                  <div key={block.id}>
                    <MainHeading label="Work Experience" />
                    <div className="flex justify-between items-baseline">
                      <p className="text-[11px] font-bold text-[#0a1628]">{str(block, "role")}</p>
                      <p className="text-[9.5px] text-gray-400">{[str(block, "startDate"), str(block, "endDate")].filter(Boolean).join(" - ")}</p>
                    </div>
                    <p className="text-[10px] mb-1" style={{ color: ACCENT }}>{str(block, "company")}</p>
                    <ul className="space-y-0.5">
                      {arr(block, "bullets").filter(Boolean).map((b, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[10px] text-gray-700">
                          <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: ACCENT }} />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null;

              case "education":
                return str(block, "institution") ? (
                  <div key={block.id}>
                    <MainHeading label="Education" />
                    <div className="flex justify-between items-baseline">
                      <p className="text-[11px] font-bold text-[#0a1628]">{[str(block, "degree"), str(block, "field")].filter(Boolean).join(", ")}</p>
                      <p className="text-[9.5px] text-gray-400">{[str(block, "startDate"), str(block, "endDate")].filter(Boolean).join(" - ")}</p>
                    </div>
                    <p className="text-[10px]" style={{ color: ACCENT }}>{str(block, "institution")}</p>
                    {str(block, "grade") && <p className="text-[9.5px] text-gray-400">Grade: {str(block, "grade")}</p>}
                  </div>
                ) : null;

              case "achievements":
                return arr(block, "bullets").filter(Boolean).length > 0 ? (
                  <div key={block.id}>
                    <MainHeading label="Achievements" />
                    <ul className="space-y-0.5">
                      {arr(block, "bullets").filter(Boolean).map((b, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[10px] text-gray-700">
                          <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: ACCENT }} />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null;

              case "extracurricular":
                return str(block, "organisation") ? (
                  <div key={block.id}>
                    <MainHeading label="Extracurricular" />
                    <div className="flex justify-between items-baseline">
                      <p className="text-[11px] font-bold text-[#0a1628]">{str(block, "role")}</p>
                      <p className="text-[9.5px] text-gray-400">{[str(block, "startDate"), str(block, "endDate")].filter(Boolean).join(" - ")}</p>
                    </div>
                    <p className="text-[10px] mb-1" style={{ color: ACCENT }}>{str(block, "organisation")}</p>
                    <ul className="space-y-0.5">
                      {arr(block, "bullets").filter(Boolean).map((b, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[10px] text-gray-700">
                          <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: ACCENT }} />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null;

              case "custom":
                return str(block, "body") ? (
                  <div key={block.id}>
                    <MainHeading label={str(block, "heading") || "Custom Section"} />
                    <p className="text-[10.5px] text-gray-700 leading-relaxed whitespace-pre-wrap">{str(block, "body")}</p>
                  </div>
                ) : null;

              default:
                return null;
            }
          })}
        </div>
      </div>
    </div>
  );
}
