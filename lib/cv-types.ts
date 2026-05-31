export type CVStyle = "harvard" | "creative";
export type CVFormat = "resume" | "cv";
export type SaveStatus = "idle" | "saving" | "saved" | "error";

export type BlockType =
  | "personal_info"
  | "summary"
  | "work_experience"
  | "education"
  | "skills"
  | "certifications"
  | "achievements"
  | "extracurricular"
  | "portfolio"
  | "custom";

export interface CVBlock {
  id: string;
  type: BlockType;
  // Flexible key-value content — each block type uses its own keys
  content: Record<string, string | string[]>;
}

export interface CVMeta {
  id: string | null;
  title: string;
  style: CVStyle;
  format: CVFormat;
  targetJob: string;
  isDirty: boolean;
}

export interface CVState {
  meta: CVMeta;
  blocks: {
    byId: Record<string, CVBlock>;
    allIds: string[];
  };
  ui: {
    activeBlockId: string | null;
    saveStatus: SaveStatus;
  };
}

// Default content shapes per block type
export const DEFAULT_BLOCK_CONTENT: Record<BlockType, Record<string, string | string[]>> = {
  personal_info: {
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: "",
  },
  summary: { text: "" },
  work_experience: {
    company: "",
    role: "",
    startDate: "",
    endDate: "",
    current: "false",
    bullets: [],
  },
  education: {
    institution: "",
    degree: "",
    field: "",
    startDate: "",
    endDate: "",
    grade: "",
  },
  skills: { items: [] },
  certifications: {
    name: "",
    issuer: "",
    date: "",
    url: "",
  },
  achievements: { bullets: [] },
  extracurricular: {
    organisation: "",
    role: "",
    startDate: "",
    endDate: "",
    bullets: [],
  },
  portfolio: {
    title: "",
    url: "",
    description: "",
  },
  custom: {
    heading: "",
    body: "",
  },
};

export const BLOCK_LABELS: Record<BlockType, string> = {
  personal_info: "Personal Info",
  summary: "Summary",
  work_experience: "Work Experience",
  education: "Education",
  skills: "Skills",
  certifications: "Certifications",
  achievements: "Achievements",
  extracurricular: "Extracurricular",
  portfolio: "Portfolio",
  custom: "Custom Section",
};

// Block types available in the palette
export const PALETTE_BLOCKS: BlockType[] = [
  "work_experience",
  "education",
  "skills",
  "certifications",
  "achievements",
  "extracurricular",
  "portfolio",
  "custom",
];

// Default block order for a fresh CV
export const DEFAULT_BLOCK_ORDER: BlockType[] = [
  "personal_info",
  "summary",
  "work_experience",
  "education",
  "skills",
];
