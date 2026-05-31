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
import { GripVertical, Trash2, Plus, Eye, Save, ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  initCV, loadBlocks, setTitle, addBlock,
  removeBlock, setActiveBlock, reorderBlocks,
} from "@/store/slices/cvSlice";
import { BlockEditor } from "@/components/cv/blocks/BlockEditor";
import { HarvardTemplate } from "@/components/cv/templates/HarvardTemplate";
import { CreativeTemplate } from "@/components/cv/templates/CreativeTemplate";
import type { CVBlock, BlockType } from "@/lib/cv-types";
import { BLOCK_LABELS, PALETTE_BLOCKS } from "@/lib/cv-types";

// ---------- Sortable block row ----------

function SortableBlock({
  block, isActive, onClick, onRemove,
}: {
  block: CVBlock; isActive: boolean; onClick: () => void; onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

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
        "flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-all group",
        isActive
          ? "border-[#0a1628] bg-[#0a1628]/5"
          : "border-gray-200 bg-white hover:border-gray-300",
      ].join(" ")}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-gray-300 hover:text-gray-400 cursor-grab active:cursor-grabbing shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={14} />
      </button>

      <span className="flex-1 text-xs font-medium text-[#0a1628] truncate">
        {BLOCK_LABELS[block.type]}
      </span>

      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="text-gray-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
      >
        <Trash2 size={13} />
      </button>
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

  const activeBlock = ui.activeBlockId ? blocks.byId[ui.activeBlockId] : null;
  const Template = meta.style === "creative" ? CreativeTemplate : HarvardTemplate;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#0a1628]/20 border-t-[#0a1628] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#f5f0e8] overflow-hidden">
      {/* Top bar */}
      <header className="h-12 bg-[#0a1628] flex items-center px-4 gap-3 shrink-0 border-b border-white/5">
        <button
          onClick={() => router.push("/dashboard/cv")}
          className="text-white/40 hover:text-white transition-colors"
        >
          <ChevronLeft size={18} />
        </button>

        <input
          value={meta.title}
          onChange={(e) => dispatch(setTitle(e.target.value))}
          className="flex-1 bg-transparent text-white text-sm font-medium focus:outline-none placeholder:text-white/30 min-w-0"
          placeholder="Untitled CV"
        />

        <SaveBadge status={ui.saveStatus} />

        <button
          onClick={() => router.push(`/dashboard/cv/${id}/preview`)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-medium hover:bg-white/15 transition-colors"
        >
          <Eye size={13} />
          Preview
        </button>
      </header>

      {/* Three-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: block palette + sorted list */}
        <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Sections</p>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={blocks.allIds} strategy={verticalListSortingStrategy}>
                <div className="space-y-1">
                  {blocks.allIds.map((blockId: string) => {
                    const block = blocks.byId[blockId];
                    if (!block) return null;
                    return (
                      <SortableBlock
                        key={blockId}
                        block={block}
                        isActive={ui.activeBlockId === blockId}
                        onClick={() => dispatch(setActiveBlock(blockId))}
                        onRemove={() => dispatch(removeBlock(blockId))}
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

        {/* Centre: live preview */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <div className="w-[794px] min-w-0 mx-auto shadow-xl">
            <Template blocks={blocks.byId} allIds={blocks.allIds} />
          </div>
        </main>

        {/* Right: property panel */}
        <aside className="w-72 shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
          {activeBlock ? (
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
                <Save size={18} className="text-gray-300" />
              </div>
              <p className="text-xs font-medium text-gray-400">Select a section</p>
              <p className="text-[11px] text-gray-300 mt-1">Click any section on the left to edit its content</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
