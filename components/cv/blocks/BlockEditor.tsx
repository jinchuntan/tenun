"use client";

import { useAppDispatch } from "@/store/hooks";
import { updateBlockContent } from "@/store/slices/cvSlice";
import type { CVBlock } from "@/lib/cv-types";
import { Plus, X } from "lucide-react";

// ---------- Shared field primitives ----------

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-[#0a1628] placeholder:text-gray-300 focus:outline-none focus:border-[#0a1628] transition-colors"
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-[#0a1628] placeholder:text-gray-300 focus:outline-none focus:border-[#0a1628] transition-colors resize-none"
    />
  );
}

function BulletList({ items, onChange, placeholder }: {
  items: string[]; onChange: (items: string[]) => void; placeholder?: string;
}) {
  function update(index: number, value: string) {
    const next = [...items];
    next[index] = value;
    onChange(next);
  }
  function add() { onChange([...items, ""]); }
  function remove(index: number) { onChange(items.filter((_, i) => i !== index)); }

  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-1.5">
          <span className="mt-2 w-1 h-1 rounded-full bg-gray-400 shrink-0" />
          <input
            value={item}
            onChange={(e) => update(i, e.target.value)}
            placeholder={placeholder ?? "Add bullet point..."}
            className="flex-1 px-2 py-1.5 rounded border border-gray-200 text-xs text-[#0a1628] placeholder:text-gray-300 focus:outline-none focus:border-[#0a1628] transition-colors"
          />
          <button onClick={() => remove(i)} className="mt-1 text-gray-300 hover:text-red-400 transition-colors">
            <X size={12} />
          </button>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-1 text-[11px] text-[#4164b4] hover:underline mt-1">
        <Plus size={12} /> Add bullet
      </button>
    </div>
  );
}

function TagList({ items, onChange, placeholder }: {
  items: string[]; onChange: (items: string[]) => void; placeholder?: string;
}) {
  function add(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = (e.target as HTMLInputElement).value.trim().replace(/,$/, "");
      if (val && !items.includes(val)) onChange([...items, val]);
      (e.target as HTMLInputElement).value = "";
    }
  }
  function remove(tag: string) { onChange(items.filter((t) => t !== tag)); }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {items.map((tag) => (
          <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-600">
            {tag}
            <button onClick={() => remove(tag)} className="text-gray-400 hover:text-red-400">
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      <input
        onKeyDown={add}
        placeholder={placeholder ?? "Type and press Enter..."}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs text-[#0a1628] placeholder:text-gray-300 focus:outline-none focus:border-[#0a1628] transition-colors"
      />
    </div>
  );
}

// ---------- Hook ----------

function useBlockField(block: CVBlock) {
  const dispatch = useAppDispatch();
  const str = (key: string) => (block.content[key] as string) ?? "";
  const arr = (key: string) => (block.content[key] as string[]) ?? [];
  const set = (key: string) => (value: string | string[]) =>
    dispatch(updateBlockContent({ id: block.id, key, value }));
  return { str, arr, set };
}

// ---------- Block editors ----------

function PersonalInfoEditor({ block }: { block: CVBlock }) {
  const { str, set } = useBlockField(block);
  return (
    <div className="space-y-3">
      <Field label="Full name"><Input value={str("name")} onChange={set("name")} placeholder="Jane Smith" /></Field>
      <Field label="Email"><Input value={str("email")} onChange={set("email")} placeholder="jane@email.com" type="email" /></Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Phone"><Input value={str("phone")} onChange={set("phone")} placeholder="+60 12 345 6789" /></Field>
        <Field label="Location"><Input value={str("location")} onChange={set("location")} placeholder="Kuala Lumpur" /></Field>
      </div>
      <Field label="LinkedIn"><Input value={str("linkedin")} onChange={set("linkedin")} placeholder="linkedin.com/in/janesmith" /></Field>
      <Field label="Website / Portfolio"><Input value={str("website")} onChange={set("website")} placeholder="janesmith.com" /></Field>
    </div>
  );
}

function SummaryEditor({ block }: { block: CVBlock }) {
  const { str, set } = useBlockField(block);
  return (
    <Field label="Professional summary">
      <Textarea value={str("text")} onChange={set("text")} placeholder="Write 2-3 sentences about your background and what you bring..." rows={4} />
    </Field>
  );
}

function WorkExperienceEditor({ block }: { block: CVBlock }) {
  const { str, arr, set } = useBlockField(block);
  return (
    <div className="space-y-3">
      <Field label="Company"><Input value={str("company")} onChange={set("company")} placeholder="Acme Corp" /></Field>
      <Field label="Role / Title"><Input value={str("role")} onChange={set("role")} placeholder="Software Engineer" /></Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Start date"><Input value={str("startDate")} onChange={set("startDate")} placeholder="Jan 2022" /></Field>
        <Field label="End date"><Input value={str("endDate")} onChange={set("endDate")} placeholder="Present" /></Field>
      </div>
      <Field label="Key achievements">
        <BulletList items={arr("bullets")} onChange={set("bullets")} placeholder="Describe what you built or achieved..." />
      </Field>
    </div>
  );
}

function EducationEditor({ block }: { block: CVBlock }) {
  const { str, set } = useBlockField(block);
  return (
    <div className="space-y-3">
      <Field label="Institution"><Input value={str("institution")} onChange={set("institution")} placeholder="University of Malaya" /></Field>
      <Field label="Degree"><Input value={str("degree")} onChange={set("degree")} placeholder="Bachelor of Science" /></Field>
      <Field label="Field of study"><Input value={str("field")} onChange={set("field")} placeholder="Computer Science" /></Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Start date"><Input value={str("startDate")} onChange={set("startDate")} placeholder="Sep 2018" /></Field>
        <Field label="End date"><Input value={str("endDate")} onChange={set("endDate")} placeholder="Jun 2022" /></Field>
      </div>
      <Field label="Grade / CGPA"><Input value={str("grade")} onChange={set("grade")} placeholder="3.8 / 4.0" /></Field>
    </div>
  );
}

function SkillsEditor({ block }: { block: CVBlock }) {
  const { arr, set } = useBlockField(block);
  return (
    <Field label="Skills">
      <TagList items={arr("items")} onChange={set("items")} placeholder="Type a skill and press Enter..." />
    </Field>
  );
}

function CertificationsEditor({ block }: { block: CVBlock }) {
  const { str, set } = useBlockField(block);
  return (
    <div className="space-y-3">
      <Field label="Certification name"><Input value={str("name")} onChange={set("name")} placeholder="AWS Solutions Architect" /></Field>
      <Field label="Issuing organisation"><Input value={str("issuer")} onChange={set("issuer")} placeholder="Amazon Web Services" /></Field>
      <Field label="Date"><Input value={str("date")} onChange={set("date")} placeholder="Mar 2023" /></Field>
      <Field label="Credential URL"><Input value={str("url")} onChange={set("url")} placeholder="https://..." /></Field>
    </div>
  );
}

function AchievementsEditor({ block }: { block: CVBlock }) {
  const { arr, set } = useBlockField(block);
  return (
    <Field label="Achievements">
      <BulletList items={arr("bullets")} onChange={set("bullets")} placeholder="Describe an achievement..." />
    </Field>
  );
}

function ExtracurricularEditor({ block }: { block: CVBlock }) {
  const { str, arr, set } = useBlockField(block);
  return (
    <div className="space-y-3">
      <Field label="Organisation"><Input value={str("organisation")} onChange={set("organisation")} placeholder="Student Council" /></Field>
      <Field label="Role"><Input value={str("role")} onChange={set("role")} placeholder="President" /></Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Start date"><Input value={str("startDate")} onChange={set("startDate")} placeholder="Jan 2021" /></Field>
        <Field label="End date"><Input value={str("endDate")} onChange={set("endDate")} placeholder="Dec 2021" /></Field>
      </div>
      <Field label="Highlights">
        <BulletList items={arr("bullets")} onChange={set("bullets")} placeholder="What did you do or achieve?" />
      </Field>
    </div>
  );
}

function PortfolioEditor({ block }: { block: CVBlock }) {
  const { str, set } = useBlockField(block);
  return (
    <div className="space-y-3">
      <Field label="Project title"><Input value={str("title")} onChange={set("title")} placeholder="Personal Portfolio" /></Field>
      <Field label="URL"><Input value={str("url")} onChange={set("url")} placeholder="https://..." /></Field>
      <Field label="Description"><Textarea value={str("description")} onChange={set("description")} placeholder="What is this project?" rows={3} /></Field>
    </div>
  );
}

function CustomEditor({ block }: { block: CVBlock }) {
  const { str, set } = useBlockField(block);
  return (
    <div className="space-y-3">
      <Field label="Section heading"><Input value={str("heading")} onChange={set("heading")} placeholder="Custom Section" /></Field>
      <Field label="Content"><Textarea value={str("body")} onChange={set("body")} placeholder="Write anything..." rows={4} /></Field>
    </div>
  );
}

// ---------- Router ----------

const EDITORS: Record<CVBlock["type"], React.ComponentType<{ block: CVBlock }>> = {
  personal_info: PersonalInfoEditor,
  summary: SummaryEditor,
  work_experience: WorkExperienceEditor,
  education: EducationEditor,
  skills: SkillsEditor,
  certifications: CertificationsEditor,
  achievements: AchievementsEditor,
  extracurricular: ExtracurricularEditor,
  portfolio: PortfolioEditor,
  custom: CustomEditor,
};

export function BlockEditor({ block }: { block: CVBlock }) {
  const Editor = EDITORS[block.type];
  return Editor ? <Editor block={block} /> : null;
}
