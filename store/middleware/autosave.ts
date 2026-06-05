import type { Middleware } from "@reduxjs/toolkit";
import { setSaveStatus } from "@/store/slices/cvSlice";
import { createClient } from "@/lib/supabase/client";
import type { CVState } from "@/lib/cv-types";

// Minimal state shape — avoids circular import with store/index.ts
interface StateWithCV {
  cv: CVState;
}

let timer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 2000;

const DIRTY_ACTIONS = new Set([
  "cv/setTitle", "cv/setStyle", "cv/setFormat", "cv/setTargetJob",
  "cv/addBlock", "cv/addBlockWithContent", "cv/removeBlock",
  "cv/updateBlockContent", "cv/replaceBlockContent", "cv/reorderBlocks",
]);

export const autosaveMiddleware: Middleware<object, StateWithCV> =
  (storeAPI) => (next) => (action) => {
    const result = next(action);

    if (!DIRTY_ACTIONS.has((action as { type: string }).type)) return result;

    const { meta, blocks } = storeAPI.getState().cv;
    if (!meta.id) return result;

    if (timer) clearTimeout(timer);

    timer = setTimeout(async () => {
      storeAPI.dispatch(setSaveStatus("saving"));

      const supabase = createClient();
      if (!supabase) { storeAPI.dispatch(setSaveStatus("error")); return; }

      try {
        // user_id is required by the NOT NULL constraint and RLS policies on
        // both cvs and cv_blocks — without it the upsert is rejected.
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { storeAPI.dispatch(setSaveStatus("error")); return; }

        const { error: metaError } = await supabase.from("cvs").upsert({
          id: meta.id,
          user_id: user.id,
          title: meta.title,
          style: meta.style,
          format: meta.format,
          target_job: meta.targetJob,
          updated_at: new Date().toISOString(),
        });
        if (metaError) throw metaError;

        const blockRows = blocks.allIds.map((blockId: string, position: number) => ({
          id: blockId,
          cv_id: meta.id,
          user_id: user.id,
          type: blocks.byId[blockId].type,
          content: blocks.byId[blockId].content,
          position,
        }));

        const { error: deleteError } = await supabase
          .from("cv_blocks")
          .delete()
          .eq("cv_id", meta.id)
          .not("id", "in", `(${blocks.allIds.map((bid: string) => `"${bid}"`).join(",")})`);
        if (deleteError) throw deleteError;

        const { error: blocksError } = await supabase.from("cv_blocks").upsert(blockRows);
        if (blocksError) throw blocksError;

        storeAPI.dispatch(setSaveStatus("saved"));
      } catch {
        storeAPI.dispatch(setSaveStatus("error"));
      }
    }, DEBOUNCE_MS);

    return result;
  };
