"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates, useSortable,
  verticalListSortingStrategy, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical, Trash2, Plus, Eye, ChevronLeft, LayoutDashboard,
  ChevronUp, ChevronDown, Lock, Sparkles, SlidersHorizontal,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  initCV, loadBlocks, setTitle, addBlock,
  removeBlock, setActiveBlock, reorderBlocks,
} from "@/store/slices/cvSlice";
import { BlockEditor } from "@/components/cv/blocks/BlockEditor";
import { CVAssistant } from "@/components/cv/assistant/CVAssistant";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { HarvardTemplate } from "@/components/cv/templates/HarvardTemplate";
import { CreativeTemplate } from "@/components/cv/templates/CreativeTemplate";
import type { CVBlock, BlockType } from "@/lib/cv-types";
import { BLOCK_LABELS, PALETTE_BLOCKS } from "@/lib/cv-types";

// ---------- Sortable block row ----------

function SortableBlock({
  block, isActive, isFirst, isLast, onClick, onRemove, onMove,
}: {
  block: CVBlock;
  isActive: boolean;
  isFirst: boolean;
  isLast: boolean;
  onClick: () => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const required = block.type === "personal_info"; // Personal Info can't be deleted

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={[
        "flex items-center gap-1.5 px-2.5 py-2.5 rounded-lg border cursor-pointer transition-all group",
        isActive
          ? "border-[#0a1628] bg-[#0a1628]/5"
          : "border-gray-200 bg-white hover:border-gray-300",
      ].join(" ")}
    >
      {/* Drag handle — primary on desktop (hidden on touch where up/down is used) */}
      <button
        {...attributes}
        {...listeners}
        className="hidden sm:block text-gray-300 hover:text-gray-400 cursor-grab active:cursor-grabbing shrink-0"
        onClick={(e) => e.stopPropagation()}
        aria-label={`Drag to reorder ${BLOCK_LABELS[block.type]}`}
      >
        <GripVertical size={14} />
      </button>

      <span className="flex-1 text-xs font-medium text-[#0a1628] truncate">
        {BLOCK_LABELS[block.type]}
      </span>

      {/* Up/down reorder — keyboard- and touch-friendly fallback for drag-drop */}
      <div className="flex items-center shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); onMove(-1); }}
          disabled={isFirst}
          aria-label={`Move ${BLOCK_LABELS[block.type]} up`}
          className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-30 disabled:hover:text-gray-300 transition-colors"
        >
          <ChevronUp size={13} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onMove(1); }}
          disabled={isLast}
          aria-label={`Move ${BLOCK_LABELS[block.type]} down`}
          className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-30 disabled:hover:text-gray-300 transition-colors"
        >
          <ChevronDown size={13} />
        </button>
      </div>

      {required ? (
        <span className="shrink-0 text-gray-300" title="Required section — can't be removed" aria-label="Required section">
          <Lock size={12} />
        </span>
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          aria-label={`Remove ${BLOCK_LABELS[block.type]}`}
          className="text-gray-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}

// ---------- Save status badge ----------

function SaveBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    idle: "text-gray-300",
    saving: "text-amber-500",
    saved: "text-green-500",
    error: "text-red-500",
  };
  const label: Record<string, string> = {
    idle: "No changes",
    saving: "Saving...",
    saved: "Saved",
    error: "Save failed",
  };
  return <span className={`text-[11px] ${map[status] ?? "text-gray-300"}`}>{label[status]}</span>;
}

// ---------- Canvas page ----------

export default function EditCVPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { meta, blocks, ui } = useAppSelector((s) => s.cv);
  const [loading, setLoading] = useState(true);
  const [panelTab, setPanelTab] = useState<"edit" | "assistant">("edit");
  // On small screens only one panel shows at a time (preview lives behind the
  // header "Preview" button); on lg+ all columns are visible together.
  const [mobileView, setMobileView] = useState<"sections" | "edit">("sections");

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) { setLoading(false); return; }

    async function load() {
      const { data: cvRow } = await supabase!
        .from("cvs")
        .select("*")
        .eq("id", id)
        .single();
      if (!cvRow) { router.push("/dashboard/cv"); return; }

      const { data: blockRows } = await supabase!
        .from("cv_blocks")
        .select("*")
        .eq("cv_id", id)
        .order("position");

      dispatch(initCV({
        id: cvRow.id,
        title: cvRow.title,
        style: cvRow.style,
        format: cvRow.format,
        targetJob: cvRow.target_job ?? "",
      }));

      if (blockRows?.length) {
        dispatch(loadBlocks(
          blockRows.map((r) => ({ id: r.id, type: r.type, content: r.content }))
        ));
      }

      setLoading(false);
    }

    load();
  }, [id, dispatch, router]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.allIds.indexOf(active.id as string);
    const newIndex = blocks.allIds.indexOf(over.id as string);
    dispatch(reorderBlocks(arrayMove(blocks.allIds, oldIndex, newIndex)));
  }

  function moveBlock(id: string, dir: -1 | 1) {
    const idx = blocks.allIds.indexOf(id);
    const target = idx + dir;
    if (idx === -1 || target < 0 || target >= blocks.allIds.length) return;
    dispatch(reorderBlocks(arrayMove(blocks.allIds, idx, target)));
  }

  const activeBlock = ui.activeBlockId ? blocks.byId[ui.activeBlockId] : null;
  const Template = meta.style === "creative" ? CreativeTemplate : HarvardTemplate;

  // Guard navigation while a save may still be in flight (autosave debounces 2s).
  const hasUnsaved = meta.isDirty || ui.saveStatus === "saving";
  function leave(href: string) {
    if (hasUnsaved && !window.confirm("Your latest changes may still be saving. Leave this page anyway?")) return;
    router.push(href);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading your CV…" className="flex-col gap-3" labelClassName="text-sm" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#f5f0e8] overflow-hidden">
      {/* Top bar */}
      <header className="h-14 bg-[#0a1628] flex items-center px-3 sm:px-4 gap-2 sm:gap-3 shrink-0 border-b border-white/5">
        <button
          onClick={() => leave("/dashboard/cv")}
          className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors shrink-0"
          aria-label="Back to all CVs"
        >
          <ChevronLeft size={18} />
          <span className="hidden sm:inline text-xs font-medium">All CVs</span>
        </button>

        {/* Breadcrumb context */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-white/30 shrink-0" aria-hidden="true">
          <span>Dashboard</span><span>/</span><span>CV Builder</span><span>/</span>
          <span className="text-white/60 font-medium">Editing</span>
        </div>

        <div className="hidden lg:block w-px h-4 bg-white/10 shrink-0" />

        <input
          value={meta.title}
          onChange={(e) => dispatch(setTitle(e.target.value))}
          className="flex-1 bg-transparent text-white text-sm font-medium focus:outline-none placeholder:text-white/30 min-w-0"
          placeholder="Untitled CV"
          aria-label="CV title"
        />

        <SaveBadge status={ui.saveStatus} />

        <button
          onClick={() => leave("/dashboard")}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors text-xs font-medium shrink-0"
        >
          <LayoutDashboard size={13} />
          Dashboard
        </button>

        <button
          onClick={() => leave(`/dashboard/cv/${id}/preview`)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-medium hover:bg-white/15 transition-colors shrink-0"
        >
          <Eye size={13} />
          Preview
        </button>
      </header>

      {/* Mobile view switcher — preview stays behind the header "Preview" button */}
      <div className="lg:hidden flex shrink-0 bg-white border-b border-gray-200">
        {([["sections", "Sections"], ["edit", "Editor"]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setMobileView(key)}
            className={[
              "flex-1 py-2.5 text-xs font-semibold transition-colors",
              mobileView === key
                ? "text-[#0a1628] border-b-2 border-[#d4a017]"
                : "text-gray-400 hover:text-gray-600",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Responsive layout: stacked single-panel on mobile, three columns on lg+ */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: block palette + sorted list */}
        <aside
          className={[
            mobileView === "sections" ? "flex" : "hidden",
            "lg:flex w-full lg:w-56 shrink-0 bg-white lg:border-r border-gray-200 flex-col overflow-hidden",
          ].join(" ")}
        >
          <div className="p-3 border-b border-gray-100">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Sections</p>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={blocks.allIds} strategy={verticalListSortingStrategy}>
                <div className="space-y-1">
                  {blocks.allIds.map((blockId: string, i: number) => {
                    const block = blocks.byId[blockId];
                    if (!block) return null;
                    return (
                      <SortableBlock
                        key={blockId}
                        block={block}
                        isActive={ui.activeBlockId === blockId}
                        isFirst={i === 0}
                        isLast={i === blocks.allIds.length - 1}
                        onClick={() => { dispatch(setActiveBlock(blockId)); setMobileView("edit"); }}
                        onRemove={() => dispatch(removeBlock(blockId))}
                        onMove={(dir) => moveBlock(blockId, dir)}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Add block palette */}
          <div className="p-3 flex-1 overflow-y-auto">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Add section</p>
            <div className="space-y-1">
              {PALETTE_BLOCKS.map((type) => (
                <button
                  key={type}
                  onClick={() => dispatch(addBlock(type as BlockType))}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs text-gray-500 hover:bg-gray-50 hover:text-[#0a1628] transition-colors"
                >
                  <Plus size={12} className="shrink-0" />
                  {BLOCK_LABELS[type]}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Centre: live preview — desktop only; on smaller screens use the
            header "Preview" button. min-w-0 + overflow-auto keeps the wide A4
            page scrolling inside this pane instead of breaking the layout. */}
        <main className="hidden lg:block flex-1 min-w-0 overflow-auto bg-gray-100 p-6">
          <div className="w-[794px] mx-auto shadow-xl">
            <Template blocks={blocks.byId} allIds={blocks.allIds} />
          </div>
        </main>

        {/* Right: property panel with Edit / Assistant tabs */}
        <aside
          className={[
            mobileView === "edit" ? "flex" : "hidden",
            "lg:flex w-full lg:w-72 shrink-0 bg-white lg:border-l border-gray-200 flex-col overflow-hidden",
          ].join(" ")}
        >
          <div className="flex border-b border-gray-100 shrink-0">
            <button
              onClick={() => setPanelTab("edit")}
              className={[
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors",
                panelTab === "edit"
                  ? "text-[#0a1628] border-b-2 border-[#0a1628]"
                  : "text-gray-400 hover:text-gray-600",
              ].join(" ")}
            >
              <SlidersHorizontal size={13} /> Edit fields
            </button>
            <button
              onClick={() => setPanelTab("assistant")}
              className={[
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors",
                panelTab === "assistant"
                  ? "text-[#0a1628] border-b-2 border-[#d4a017]"
                  : "text-gray-400 hover:text-gray-600",
              ].join(" ")}
            >
              <Sparkles size={13} className={panelTab === "assistant" ? "text-[#d4a017]" : ""} /> Assistant
            </button>
          </div>

          {panelTab === "edit" ? (
            activeBlock ? (
              <>
                <div className="p-4 border-b border-gray-100">
                  <p className="text-xs font-semibold text-[#0a1628]">{BLOCK_LABELS[activeBlock.type as keyof typeof BLOCK_LABELS]}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Edit the fields below</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <BlockEditor block={activeBlock} />
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-3">
                  <SlidersHorizontal size={18} className="text-gray-300" />
                </div>
                <p className="text-xs font-medium text-gray-400">Select a section</p>
                <p className="text-[11px] text-gray-300 mt-1">Click any section on the left to edit its content</p>
              </div>
            )
          ) : (
            <CVAssistant />
          )}
        </aside>
      </div>
    </div>
  );
}
