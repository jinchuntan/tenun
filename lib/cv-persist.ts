import { createClient } from "@/lib/supabase/client";
import type { CVBlock, CVStyle, CVFormat } from "@/lib/cv-types";

export interface NewCVMeta {
  id: string;
  title: string;
  style: CVStyle;
  format: CVFormat;
  targetJob: string;
}

/**
 * Persist a brand-new CV (meta row + block rows) to Supabase.
 *
 * Returns:
 *  - "saved"   — written to Supabase successfully.
 *  - "skipped" — Supabase isn't configured locally; the caller should fall
 *                back to driving the editor from Redux state only.
 *
 * Throws on any real failure (not signed in, RLS rejection, DB error) so the
 * caller can surface a message instead of hanging silently.
 *
 * NOTE: `user_id` is required by both the NOT NULL constraint and the RLS
 * policies on `cvs` / `cv_blocks`, and the IDs must be UUIDs to match the
 * column types — see `newId()` in lib/cv-types.ts.
 */
export async function createCVInSupabase(
  meta: NewCVMeta,
  blocks: CVBlock[]
): Promise<"saved" | "skipped"> {
  const supabase = createClient();
  if (!supabase) return "skipped";

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You need to be signed in to save a CV.");
  }

  const { error: cvError } = await supabase.from("cvs").insert({
    id: meta.id,
    user_id: user.id,
    title: meta.title,
    style: meta.style,
    format: meta.format,
    target_job: meta.targetJob || null,
  });
  if (cvError) throw new Error(cvError.message);

  const blockRows = blocks.map((b, i) => ({
    id: b.id,
    cv_id: meta.id,
    user_id: user.id,
    type: b.type,
    content: b.content,
    position: i,
  }));

  const { error: blocksError } = await supabase.from("cv_blocks").insert(blockRows);
  if (blocksError) {
    // Roll back the orphaned CV row so we don't leave a header with no body.
    await supabase.from("cvs").delete().eq("id", meta.id);
    throw new Error(blocksError.message);
  }

  return "saved";
}
