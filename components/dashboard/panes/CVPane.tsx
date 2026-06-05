"use client";

import { useRouter } from "next/navigation";
import { FileText, Palette } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export function CVPane() {
  const router = useRouter();
  const { dict } = useLanguage();

  const styles = [
    {
      id: "harvard" as const,
      label: dict.cvPane.harvardLabel,
      description: dict.cvPane.harvardDesc,
      icon: <FileText size={20} className="text-[#4164b4]" />,
      accent: "#4164b4",
    },
    {
      id: "creative" as const,
      label: dict.cvPane.creativeLabel,
      description: dict.cvPane.creativeDesc,
      icon: <Palette size={20} className="text-[#6c5ce7]" />,
      accent: "#6c5ce7",
    },
  ];

  function handleSelect(styleId: "harvard" | "creative") {
    router.push(`/dashboard/cv/new?style=${styleId}&from=dashboard`);
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-[#0a1628]">{dict.cvPane.title}</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          {dict.cvPane.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {styles.map((style) => (
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
        <p className="text-xs font-medium text-[#0a1628] mb-1">{dict.cvPane.alreadyHave}</p>
        <p className="text-xs text-gray-500 mb-3">
          {dict.cvPane.uploadExisting}
        </p>
        <button
          onClick={() => router.push("/dashboard/cv/new?upload=true")}
          className="text-xs text-[#4164b4] font-medium hover:underline"
        >
          {dict.cvPane.uploadImport}
        </button>
      </div>
    </div>
  );
}
