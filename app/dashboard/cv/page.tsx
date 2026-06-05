"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Plus, FileText, Pencil, Eye, Copy, Trash2, Clock, Loader2,
} from "lucide-react";
import { AppPageShell } from "@/components/layout/AppPageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState, LoadingState } from "@/components/layout/PageState";
import { getDashboardReturn } from "@/lib/navigation";
import { newId } from "@/lib/cv-types";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface CVRow {
  id: string;
  title: string;
  style: "harvard" | "creative";
  format: "resume" | "cv";
  target_job: string | null;
  updated_at: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function CVListPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { dict } = useLanguage();
  const [cvs, setCvs] = useState<CVRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) { setLoading(false); return; }

    supabase
      .from("cvs")
      .select("id, title, style, format, target_job, updated_at")
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        setCvs((data as CVRow[]) ?? []);
        setLoading(false);
      });
  }, []);

  async function handleDelete(cv: CVRow) {
    if (!window.confirm(dict.cvList.confirmDelete.replace("{title}", cv.title))) return;
    const supabase = createClient();
    if (!supabase) return;
    setBusyId(cv.id);
    const { error } = await supabase.from("cvs").delete().eq("id", cv.id);
    setBusyId(null);
    if (!error) setCvs((prev) => prev.filter((c) => c.id !== cv.id));
  }

  async function handleDuplicate(cv: CVRow) {
    const supabase = createClient();
    if (!supabase) return;
    setBusyId(cv.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: blockRows } = await supabase
        .from("cv_blocks").select("*").eq("cv_id", cv.id).order("position");

      const copyId = newId();
      const { error: cvError } = await supabase.from("cvs").insert({
        id: copyId,
        user_id: user.id,
        title: dict.cvList.copyOf.replace("{title}", cv.title),
        style: cv.style,
        format: cv.format,
        target_job: cv.target_job,
      });
      if (cvError) return;

      if (blockRows?.length) {
        await supabase.from("cv_blocks").insert(
          blockRows.map((b, i) => ({
            id: newId(),
            cv_id: copyId,
            user_id: user.id,
            type: b.type,
            content: b.content,
            position: i,
          }))
        );
      }
      router.push(`/dashboard/cv/${copyId}/edit`);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AppPageShell
      maxWidth="max-w-3xl"
      breadcrumbs={[
        { label: dict.cvList.breadcrumbDashboard, href: "/dashboard" },
        { label: dict.cvList.breadcrumbCvBuilder },
      ]}
      returnTo={getDashboardReturn(pathname, { labels: dict.navLabels })}
    >
      <PageHeader
        eyebrow={dict.cvList.eyebrow}
        title={dict.cvList.title}
        description={dict.cvList.description}
        actions={
          <Link
            href="/dashboard/cv/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#d4a017] text-[#0a1628] rounded-lg text-sm font-semibold hover:bg-[#e0ad1c] transition-colors"
          >
            <Plus size={16} /> {dict.cvList.newCv}
          </Link>
        }
        className="mb-6"
      />

      {loading ? (
        <LoadingState label={dict.cvList.loading} />
      ) : cvs.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-6 h-6 text-navy-300" />}
          title={dict.cvList.noCvsTitle}
          message={dict.cvList.noCvsMessage}
          action={{ label: dict.cvList.createFirst, href: "/dashboard/cv/new" }}
        />
      ) : (
        <div className="space-y-3">
          {cvs.map((cv) => (
            <div
              key={cv.id}
              className="bg-white rounded-xl border border-beige-300/60 p-4 flex items-center justify-between gap-4 hover:border-gold-300 transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-beige-50 border border-beige-300/60 flex items-center justify-center shrink-0">
                  <FileText size={16} className="text-navy-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-navy-900 truncate">{cv.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-beige-100 text-navy-500 font-medium uppercase tracking-wide">
                      {cv.style === "harvard" ? dict.cvList.harvardLabel : dict.cvList.creativeLabel}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-beige-100 text-navy-500 font-medium uppercase tracking-wide">
                      {cv.format}
                    </span>
                    {cv.target_job && (
                      <span className="text-[11px] text-navy-400 truncate">{cv.target_job}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock size={10} className="text-navy-300" />
                    <span className="text-[10px] text-navy-400">{dict.cvList.updated.replace("{date}", formatDate(cv.updated_at))}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Link
                  href={`/dashboard/cv/${cv.id}/edit`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-beige-300 text-xs font-medium text-navy-700 hover:bg-beige-50 transition-colors"
                >
                  <Pencil size={12} /> {dict.cvList.edit}
                </Link>
                <Link
                  href={`/dashboard/cv/${cv.id}/preview`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-beige-300 text-xs font-medium text-navy-700 hover:bg-beige-50 transition-colors"
                  aria-label={`${dict.cvList.preview} ${cv.title}`}
                >
                  <Eye size={12} /> <span className="hidden sm:inline">{dict.cvList.preview}</span>
                </Link>
                <button
                  onClick={() => handleDuplicate(cv)}
                  disabled={busyId === cv.id}
                  aria-label={`Duplicate ${cv.title}`}
                  title="Duplicate"
                  className="p-2 rounded-lg text-navy-400 hover:text-navy-800 hover:bg-beige-50 transition-colors disabled:opacity-50"
                >
                  {busyId === cv.id ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14} />}
                </button>
                <button
                  onClick={() => handleDelete(cv)}
                  disabled={busyId === cv.id}
                  aria-label={`Delete ${cv.title}`}
                  title="Delete"
                  className="p-2 rounded-lg text-navy-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppPageShell>
  );
}
