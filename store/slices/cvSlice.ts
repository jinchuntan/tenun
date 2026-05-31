import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { nanoid } from "@reduxjs/toolkit";
import type {
  CVState, CVBlock, CVMeta, BlockType, CVStyle, CVFormat, SaveStatus,
} from "@/lib/cv-types";
import { DEFAULT_BLOCK_CONTENT, DEFAULT_BLOCK_ORDER } from "@/lib/cv-types";

function makeBlock(type: BlockType): CVBlock {
  return {
    id: nanoid(),
    type,
    content: { ...DEFAULT_BLOCK_CONTENT[type] },
  };
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
      const block = makeBlock(action.payload);
      state.blocks.byId[block.id] = block;
      state.blocks.allIds.push(block.id);
      state.ui.activeBlockId = block.id;
      state.meta.isDirty = true;
    },
    removeBlock(state, action: PayloadAction<string>) {
      const id = action.payload;
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
    reorderBlocks(state, action: PayloadAction<string[]>) {
      state.blocks.allIds = action.payload;
      state.meta.isDirty = true;
    },
    loadBlocks(state, action: PayloadAction<CVBlock[]>) {
      const blocks = action.payload;
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
  addBlock, removeBlock, updateBlockContent, reorderBlocks, loadBlocks,
  setActiveBlock, setSaveStatus,
} = cvSlice.actions;

export default cvSlice.reducer;
