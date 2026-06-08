import { test } from "@playwright/test";
import { openDashboard, openTab } from "./helpers";

/**
 * Demo personas smoke test. Each persona loads the dashboard and renders the
 * Summary, Paths and Skills panes without crashing — including the minimal
 * (low-information) user, which exercises fallbacks/empty states.
 */
const PERSONAS = [
  "generalist",
  "technologist",
  "creative",
  "builder",
  "climate",
  "university",
  "minimal",
] as const;

test.describe("Demo personas", () => {
  for (const persona of PERSONAS) {
    test(`persona "${persona}" renders core tabs`, async ({ page }) => {
      await openDashboard(page, persona);
      await openTab(page, "Summary", "What we can work on together");
      await openTab(page, "Paths", "Leadership Path");
      await openTab(page, "Skills", "Skill Gaps");
    });
  }
});
