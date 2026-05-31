"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, FileText, Pencil, Clock } from "lucide-react";

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
  const [cvs, setCvs] = useState<CVRow[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-[#f5f0e8] p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-[#0a1628]">Your CVs</h1>
            <p className="text-xs text-gray-400 mt-0.5">Build, edit, and export your CVs</p>
          </div>
          <button
            onClick={() => router.push("/dashboard/cv/new")}
            className="flex items-center gap-2 px-4 py-2 bg-[#0a1628] text-white rounded-lg text-sm font-medium hover:bg-[#1a2a4a] transition-colors"
          >
            <Plus size={16} />
            New CV
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#0a1628]/20 border-t-[#0a1628] rounded-full animate-spin" />
          </div>
        ) : cvs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-white rounded-xl border border-gray-200 flex items-center justify-center mb-4">
              <FileText size={24} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">No CVs yet</p>
            <p className="text-xs text-gray-400 mt-1 mb-5">Create your first CV to get started.</p>
            <button
              onClick={() => router.push("/dashboard/cv/new")}
              className="flex items-center gap-2 px-4 py-2 bg-[#0a1628] text-white rounded-lg text-sm font-medium hover:bg-[#1a2a4a] transition-colors"
            >
              <Plus size={16} />
              Create CV
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {cvs.map((cv) => (
              <div
                key={cv.id}
                className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
                    <FileText size={16} className="text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#0a1628] truncate">{cv.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium uppercase tracking-wide">
                        {cv.style === "harvard" ? "Harvard" : "Creative"}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium uppercase tracking-wide">
                        {cv.format}
                      </span>
                      {cv.target_job && (
                        <span className="text-[11px] text-gray-400 truncate">{cv.target_job}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock size={10} className="text-gray-300" />
                      <span className="text-[10px] text-gray-400">{formatDate(cv.updated_at)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/dashboard/cv/${cv.id}/edit`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
                >
                  <Pencil size={12} />
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
