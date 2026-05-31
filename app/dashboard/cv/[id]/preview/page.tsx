"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { HarvardTemplate } from "@/components/cv/templates/HarvardTemplate";
import { CreativeTemplate } from "@/components/cv/templates/CreativeTemplate";
import type { CVBlock, CVStyle } from "@/lib/cv-types";

interface LoadedCV {
  title: string;
  style: CVStyle;
  blocks: { byId: Record<string, CVBlock>; allIds: string[] };
}

export default function PreviewCVPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [cv, setCV] = useState<LoadedCV | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) { setLoading(false); return; }

    async function load() {
      const { data: cvRow } = await supabase!.from("cvs").select("*").eq("id", id).single();
      if (!cvRow) { router.push("/dashboard/cv"); return; }

      const { data: blockRows } = await supabase!
        .from("cv_blocks").select("*").eq("cv_id", id).order("position");

      const blocks = (blockRows ?? []).map((r) => ({ id: r.id, type: r.type, content: r.content } as CVBlock));
      setCV({
        title: cvRow.title,
        style: cvRow.style,
        blocks: {
          byId: Object.fromEntries(blocks.map((b) => [b.id, b])),
          allIds: blocks.map((b) => b.id),
        },
      });
      setLoading(false);
    }
    load();
  }, [id, router]);

  const Template = cv?.style === "creative" ? CreativeTemplate : HarvardTemplate;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#0a1628]/20 border-t-[#0a1628] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; background: white; }
          .print-page { box-shadow: none !important; margin: 0 !important; width: 100% !important; }
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print sticky top-0 z-10 h-12 bg-[#0a1628] flex items-center px-4 gap-3">
        <button
          onClick={() => router.push(`/dashboard/cv/${id}/edit`)}
          className="text-white/40 hover:text-white transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="flex-1 text-white text-sm font-medium truncate">{cv?.title ?? "Preview"}</p>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d4a017] text-white text-xs font-medium hover:bg-[#b8860b] transition-colors"
        >
          <Download size={13} />
          Export PDF
        </button>
      </div>

      {/* Preview */}
      <div className="no-print bg-gray-200 min-h-screen py-8 px-4">
        {cv && (
          <div className="w-[794px] mx-auto shadow-2xl print-page">
            <Template blocks={cv.blocks.byId} allIds={cv.blocks.allIds} />
          </div>
        )}
      </div>

      {/* Print-only render */}
      {cv && (
        <div className="hidden print:block print-page">
          <Template blocks={cv.blocks.byId} allIds={cv.blocks.allIds} />
        </div>
      )}
    </>
  );
}
