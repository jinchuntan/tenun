import type { CVBlock } from "@/lib/cv-types";

function str(block: CVBlock, key: string): string {
  return (block.content[key] as string) ?? "";
}
function arr(block: CVBlock, key: string): string[] {
  return (block.content[key] as string[]) ?? [];
}

function Divider() {
  return <hr className="border-t border-[#0a1628] my-2" />;
}

function SectionHeading({ label }: { label: string }) {
  return (
    <div className="mt-4 mb-1">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#0a1628]">{label}</p>
      <Divider />
    </div>
  );
}

function renderBlock(block: CVBlock) {
  switch (block.type) {
    case "personal_info":
      return (
        <div className="text-center mb-3">
          <p className="text-2xl font-bold text-[#0a1628] leading-tight">{str(block, "name") || "Your Name"}</p>
          <div className="flex flex-wrap justify-center gap-x-3 mt-1 text-[10px] text-gray-500">
            {str(block, "email") && <span>{str(block, "email")}</span>}
            {str(block, "phone") && <span>{str(block, "phone")}</span>}
            {str(block, "location") && <span>{str(block, "location")}</span>}
            {str(block, "linkedin") && <span>{str(block, "linkedin")}</span>}
            {str(block, "website") && <span>{str(block, "website")}</span>}
          </div>
        </div>
      );

    case "summary":
      return str(block, "text") ? (
        <>
          <SectionHeading label="Summary" />
          <p className="text-[10.5px] text-gray-700 leading-relaxed">{str(block, "text")}</p>
        </>
      ) : null;

    case "work_experience":
      return str(block, "company") || str(block, "role") ? (
        <>
          <SectionHeading label="Work Experience" />
          <div className="flex justify-between items-baseline">
            <p className="text-[11px] font-bold text-[#0a1628]">{str(block, "role")}</p>
            <p className="text-[9.5px] text-gray-400">{[str(block, "startDate"), str(block, "endDate")].filter(Boolean).join(" - ")}</p>
          </div>
          <p className="text-[10px] text-gray-500 italic mb-1">{str(block, "company")}</p>
          <ul className="space-y-0.5">
            {arr(block, "bullets").filter(Boolean).map((b, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[10px] text-gray-700">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </>
      ) : null;

    case "education":
      return str(block, "institution") || str(block, "degree") ? (
        <>
          <SectionHeading label="Education" />
          <div className="flex justify-between items-baseline">
            <p className="text-[11px] font-bold text-[#0a1628]">{[str(block, "degree"), str(block, "field")].filter(Boolean).join(", ")}</p>
            <p className="text-[9.5px] text-gray-400">{[str(block, "startDate"), str(block, "endDate")].filter(Boolean).join(" - ")}</p>
          </div>
          <p className="text-[10px] text-gray-500 italic">{str(block, "institution")}</p>
          {str(block, "grade") && <p className="text-[10px] text-gray-500">Grade: {str(block, "grade")}</p>}
        </>
      ) : null;

    case "skills":
      return arr(block, "items").length > 0 ? (
        <>
          <SectionHeading label="Skills" />
          <p className="text-[10.5px] text-gray-700">{arr(block, "items").join(" · ")}</p>
        </>
      ) : null;

    case "certifications":
      return str(block, "name") ? (
        <>
          <SectionHeading label="Certifications" />
          <div className="flex justify-between items-baseline">
            <p className="text-[11px] font-bold text-[#0a1628]">{str(block, "name")}</p>
            <p className="text-[9.5px] text-gray-400">{str(block, "date")}</p>
          </div>
          <p className="text-[10px] text-gray-500">{str(block, "issuer")}</p>
        </>
      ) : null;

    case "achievements":
      return arr(block, "bullets").filter(Boolean).length > 0 ? (
        <>
          <SectionHeading label="Achievements" />
          <ul className="space-y-0.5">
            {arr(block, "bullets").filter(Boolean).map((b, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[10px] text-gray-700">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </>
      ) : null;

    case "extracurricular":
      return str(block, "organisation") ? (
        <>
          <SectionHeading label="Extracurricular" />
          <div className="flex justify-between items-baseline">
            <p className="text-[11px] font-bold text-[#0a1628]">{str(block, "role")}</p>
            <p className="text-[9.5px] text-gray-400">{[str(block, "startDate"), str(block, "endDate")].filter(Boolean).join(" - ")}</p>
          </div>
          <p className="text-[10px] text-gray-500 italic mb-1">{str(block, "organisation")}</p>
          <ul className="space-y-0.5">
            {arr(block, "bullets").filter(Boolean).map((b, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[10px] text-gray-700">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </>
      ) : null;

    case "portfolio":
      return str(block, "title") ? (
        <>
          <SectionHeading label="Portfolio" />
          <p className="text-[11px] font-bold text-[#0a1628]">{str(block, "title")}</p>
          {str(block, "url") && <p className="text-[10px] text-[#4164b4]">{str(block, "url")}</p>}
          {str(block, "description") && <p className="text-[10px] text-gray-600 mt-0.5">{str(block, "description")}</p>}
        </>
      ) : null;

    case "custom":
      return str(block, "heading") || str(block, "body") ? (
        <>
          <SectionHeading label={str(block, "heading") || "Custom Section"} />
          <p className="text-[10.5px] text-gray-700 leading-relaxed whitespace-pre-wrap">{str(block, "body")}</p>
        </>
      ) : null;

    default:
      return null;
  }
}

export function HarvardTemplate({ blocks, allIds }: { blocks: Record<string, CVBlock>; allIds: string[] }) {
  return (
    <div className="w-full bg-white font-serif p-8 text-[#0a1628] min-h-[1056px]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
      {allIds.map((id) => {
        const block = blocks[id];
        if (!block) return null;
        const rendered = renderBlock(block);
        if (!rendered) return null;
        return <div key={id}>{rendered}</div>;
      })}
    </div>
  );
}
