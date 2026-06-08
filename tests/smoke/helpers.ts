import { expect, type Page } from "@playwright/test";

/**
 * Shared smoke-test helpers. Selectors use stable UI labels / headings (English
 * default locale) — never AI-generated text — so tests don't depend on
 * OpenRouter / Groq / Supabase being configured.
 */

/** Each dashboard tab + a stable string that proves its pane rendered. */
export const TAB_CHECKS: { label: string; content: string }[] = [
  { label: "Summary", content: "What we can work on together" },
  { label: "Profile", content: "Your Career Threads" },
  { label: "Paths", content: "Leadership Path" },
  { label: "Skills", content: "Skill Gaps" },
  { label: "Opportunities", content: "Showing matches for" },
  { label: "Universities", content: "University Career Bridge" },
  { label: "Atlas", content: "Global Career Atlas" },
  { label: "Mentors", content: "Mentors & Outreach" },
  { label: "CV / Portfolio", content: "Build your CV" },
  { label: "Interview", content: "AI Mock Interview" },
];

/** Navigate to a demo dashboard and wait for it to finish loading. */
export async function openDashboard(page: Page, demo: string = "true") {
  await page.goto(`/dashboard?demo=${demo}`);
  // Tab bar appears only after the deterministic weave finishes (past the
  // loading spinner). No network/AI dependency.
  await expect(page.getByRole("tablist")).toBeVisible();
}

/** Click a tab by its visible label and assert its pane content shows. */
export async function openTab(page: Page, label: string, content: string) {
  await page.getByRole("tab", { name: label, exact: true }).click();
  await expect(page.getByText(content, { exact: false }).first()).toBeVisible();
}
