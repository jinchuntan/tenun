import { test, expect } from "@playwright/test";
import { openDashboard, openTab } from "./helpers";

/**
 * Mobile dashboard smoke test (390×844). Confirms the tab bar is usable, key
 * tabs are reachable (the row scrolls horizontally), and there's no page-level
 * horizontal overflow.
 */
test.use({ viewport: { width: 390, height: 844 } });

test.describe("Dashboard on mobile", () => {
  test("tab bar is usable and there is no horizontal overflow", async ({ page }) => {
    await openDashboard(page, "true");

    // Summary is the default pane.
    await expect(page.getByText("What we can work on together").first()).toBeVisible();

    // Reach a few tabs across the scrollable row (Playwright scrolls them in).
    await openTab(page, "Paths", "Leadership Path");
    await openTab(page, "Universities", "University Career Bridge");
    await openTab(page, "CV / Portfolio", "Build your CV");

    // No page-level horizontal overflow (small tolerance for sub-pixel rounding).
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(2);
  });
});
