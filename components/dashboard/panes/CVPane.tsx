"use client";

import { useRouter } from "next/navigation";
import { FileText, Palette } from "lucide-react";

const STYLES = [
  {
    id: "harvard",
    label: "Harvard / ATS",
    description:
      "Clean, single or two-column layout. Optimised for applicant tracking systems. Best for corporate, finance, and consulting roles.",
    icon: <FileText size={20} className="text-[#4164b4]" />,
    accent: "#4164b4",
  },
  {
    id: "creative",
    label: "Creative / Visual",
    description:
      "Custom layout with colour accents and a portfolio section. Best for design, marketing, media, and creative roles.",
    icon: <Palette size={20} className="text-[#6c5ce7]" />,
    accent: "#6c5ce7",
  },
] as const;

export function CVPane() {
  const router = useRouter();

  function handleSelect(styleId: "harvard" | "creative") {
    router.push(`/dashboard/cv/new?style=${styleId}&from=dashboard`);
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-[#0a1628]">Build your CV</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Choose a style to get started. You can switch later.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => handleSelect(style.id)}
            className="text-left bg-white rounded-xl border-2 border-gray-200 p-5 hover:border-current transition-all hover:shadow-sm group"
            style={{ "--hover-color": style.accent } as React.CSSProperties}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = style.accent)
            }
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
              style={{ backgroundColor: style.accent + "15" }}
            >
              {style.icon}
            </div>
            <h3 className="text-sm font-semibold text-[#0a1628] mb-1">{style.label}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{style.description}</p>
          </button>
        ))}
      </div>

      <div className="mt-6 bg-gray-50 rounded-xl border border-gray-200 p-4">
        <p className="text-xs font-medium text-[#0a1628] mb-1">Already have a CV?</p>
        <p className="text-xs text-gray-500 mb-3">
          Upload your existing CV and we will pre-fill the builder for you.
        </p>
        <button
          onClick={() => router.push("/dashboard/cv/new?upload=true")}
          className="text-xs text-[#4164b4] font-medium hover:underline"
        >
          Upload and import my CV
        </button>
      </div>
    </div>
  );
}
