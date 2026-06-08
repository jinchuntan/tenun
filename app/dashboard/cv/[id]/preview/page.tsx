"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Printer, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { LoadingState } from "@/components/layout/PageState";
import { HarvardTemplate } from "@/components/cv/templates/HarvardTemplate";
import { CreativeTemplate } from "@/components/cv/templates/CreativeTemplate";
import type { CVBlock, CVStyle } from "@/lib/cv-types";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface LoadedCV {
  title: string;
  style: CVStyle;
  blocks: { byId: Record<string, CVBlock>; allIds: string[] };
}

export default function PreviewCVPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { dict } = useLanguage();
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
        <LoadingState label={dict.cvPreview.loadingPreview} />
      </div>
    );
  }

  const btnSecondary =
    "inline-flex items-center gap-1.5 rounded-lg border border-beige-300 bg-white px-3 py-1.5 text-xs font-medium text-navy-700 hover:border-navy-300 transition-colors";

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

      <div className="min-h-screen bg-gray-200">
        <AppTopBar
          className="no-print"
          breadcrumbs={[
            { label: dict.cvPreview.breadcrumbDashboard, href: "/dashboard" },
            { label: dict.cvPreview.breadcrumbCvBuilder, href: "/dashboard/cv" },
            { label: cv?.title ?? dict.cvPreview.breadcrumbPreview },
          ]}
          returnTo={{ href: "/dashboard", label: dict.cvPreview.dashboard }}
          actions={
            <>
              <Link href={`/dashboard/cv/${id}/edit`} className={btnSecondary}>
                <ChevronLeft size={14} /> <span className="hidden sm:inline">{dict.cvPreview.backToEditor}</span>
              </Link>
              <Link href="/dashboard/cv" className={btnSecondary} aria-label={dict.cvPreview.allCvs}>
                <FileText size={14} /> <span className="hidden sm:inline">{dict.cvPreview.allCvs}</span>
              </Link>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d4a017] text-[#0a1628] text-xs font-semibold hover:bg-[#e0ad1c] transition-colors"
              >
                <Printer size={14} />
                <span className="hidden sm:inline">{dict.cvPreview.printSaveAsPdf}</span>
                <span className="sm:hidden">{dict.cvPreview.print}</span>
              </button>
            </>
          }
        />

        {/* Preview — A4 document. On narrow screens the fixed-width page
            scrolls horizontally inside this container rather than being clipped. */}
        <div className="no-print py-6 sm:py-8 px-2 sm:px-4 overflow-x-auto">
          {cv && (
            <div className="w-[794px] mx-auto shadow-2xl print-page">
              <Template blocks={cv.blocks.byId} allIds={cv.blocks.allIds} />
            </div>
          )}
        </div>
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
