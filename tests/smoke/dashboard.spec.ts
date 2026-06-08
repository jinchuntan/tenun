import { test, expect } from "@playwright/test";
import { TAB_CHECKS, openDashboard, openTab } from "./helpers";

/**
 * Dashboard demo smoke test. Loads `/dashboard?demo=true` (no login / AI) and
 * clicks through every tab, asserting each pane renders stable content.
 */
test.describe("Dashboard (demo=true)", () => {
  test("all tabs are present and render content", async ({ page }) => {
    await openDashboard(page, "true");

    // Every tab is directly visible in the tab bar (no "More" dropdown).
    for (const { label } of TAB_CHECKS) {
      await expect(page.getByRole("tab", { name: label, exact: true })).toBeVisible();
    }

    // Clicking each tab renders its pane.
    for (const { label, content } of TAB_CHECKS) {
      await openTab(page, label, content);
    }
  });
});
