import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  CVState, CVBlock, CVMeta, BlockType, CVStyle, CVFormat, SaveStatus,
} from "@/lib/cv-types";
import { DEFAULT_BLOCK_CONTENT, DEFAULT_BLOCK_ORDER, newId } from "@/lib/cv-types";

function makeBlock(type: BlockType): CVBlock {
  return {
    id: newId(),
    type,
    content: { ...DEFAULT_BLOCK_CONTENT[type] },
  };
}

function hasPersonalInfo(state: CVState): boolean {
  return state.blocks.allIds.some((id) => state.blocks.byId[id]?.type === "personal_info");
}

function buildInitialBlocks(): CVState["blocks"] {
  const blocks = DEFAULT_BLOCK_ORDER.map(makeBlock);
  return {
    byId: Object.fromEntries(blocks.map((b) => [b.id, b])),
    allIds: blocks.map((b) => b.id),
  };
}

const initialState: CVState = {
  meta: {
    id: null,
    title: "Untitled CV",
    style: "harvard",
    format: "resume",
    targetJob: "",
    isDirty: false,
  },
  blocks: buildInitialBlocks(),
  ui: {
    activeBlockId: null,
    saveStatus: "idle",
  },
};

const cvSlice = createSlice({
  name: "cv",
  initialState,
  reducers: {
    // Meta
    initCV(state, action: PayloadAction<Partial<CVMeta>>) {
      state.meta = { ...state.meta, ...action.payload, isDirty: false };
    },
    setTitle(state, action: PayloadAction<string>) {
      state.meta.title = action.payload;
      state.meta.isDirty = true;
    },
    setStyle(state, action: PayloadAction<CVStyle>) {
      state.meta.style = action.payload;
      state.meta.isDirty = true;
    },
    setFormat(state, action: PayloadAction<CVFormat>) {
      state.meta.format = action.payload;
      state.meta.isDirty = true;
    },
    setTargetJob(state, action: PayloadAction<string>) {
      state.meta.targetJob = action.payload;
      state.meta.isDirty = true;
    },

    // Blocks
    addBlock(state, action: PayloadAction<BlockType>) {
      // Personal Info is a required, single-instance section — never add a duplicate.
      if (action.payload === "personal_info" && hasPersonalInfo(state)) return;
      const block = makeBlock(action.payload);
      state.blocks.byId[block.id] = block;
      state.blocks.allIds.push(block.id);
      state.ui.activeBlockId = block.id;
      state.meta.isDirty = true;
    },
    // Add a block pre-filled with AI-suggested content (atomic, so the editor
    // and templates never see a half-populated block).
    addBlockWithContent(
      state,
      action: PayloadAction<{ type: BlockType; content: Record<string, string | string[]> }>
    ) {
      const { type, content } = action.payload;
      if (type === "personal_info" && hasPersonalInfo(state)) return;
      const block: CVBlock = {
        id: newId(),
        type,
        content: { ...DEFAULT_BLOCK_CONTENT[type], ...content },
      };
      state.blocks.byId[block.id] = block;
      state.blocks.allIds.push(block.id);
      state.ui.activeBlockId = block.id;
      state.meta.isDirty = true;
    },
    removeBlock(state, action: PayloadAction<string>) {
      const id = action.payload;
      const block = state.blocks.byId[id];
      // Personal Info is required and can never be deleted (guarded here so it
      // holds regardless of which UI triggers the action).
      if (!block || block.type === "personal_info") return;
      delete state.blocks.byId[id];
      state.blocks.allIds = state.blocks.allIds.filter((i) => i !== id);
      if (state.ui.activeBlockId === id) state.ui.activeBlockId = null;
      state.meta.isDirty = true;
    },
    updateBlockContent(
      state,
      action: PayloadAction<{ id: string; key: string; value: string | string[] }>
    ) {
      const { id, key, value } = action.payload;
      if (state.blocks.byId[id]) {
        state.blocks.byId[id].content[key] = value;
        state.meta.isDirty = true;
      }
    },
    // Replace a block's content wholesale (used when accepting an AI rewrite).
    replaceBlockContent(
      state,
      action: PayloadAction<{ id: string; content: Record<string, string | string[]> }>
    ) {
      const block = state.blocks.byId[action.payload.id];
      if (block) {
        block.content = { ...DEFAULT_BLOCK_CONTENT[block.type], ...action.payload.content };
        state.meta.isDirty = true;
      }
    },
    reorderBlocks(state, action: PayloadAction<string[]>) {
      state.blocks.allIds = action.payload;
      state.meta.isDirty = true;
    },
    loadBlocks(state, action: PayloadAction<CVBlock[]>) {
      let blocks = action.payload;
      // Guarantee exactly one Personal Info block exists; if a loaded/generated
      // CV is missing it, prepend a fresh one so the section is never absent.
      if (!blocks.some((b) => b.type === "personal_info")) {
        blocks = [makeBlock("personal_info"), ...blocks];
      }
      state.blocks.byId = Object.fromEntries(blocks.map((b) => [b.id, b]));
      state.blocks.allIds = blocks.map((b) => b.id);
      state.meta.isDirty = false;
    },

    // UI
    setActiveBlock(state, action: PayloadAction<string | null>) {
      state.ui.activeBlockId = action.payload;
    },
    setSaveStatus(state, action: PayloadAction<SaveStatus>) {
      state.ui.saveStatus = action.payload;
      if (action.payload === "saved") state.meta.isDirty = false;
    },
  },
});

export const {
  initCV, setTitle, setStyle, setFormat, setTargetJob,
  addBlock, addBlockWithContent, removeBlock, updateBlockContent,
  replaceBlockContent, reorderBlocks, loadBlocks,
  setActiveBlock, setSaveStatus,
} = cvSlice.actions;

export default cvSlice.reducer;
