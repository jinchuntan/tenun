import { test, expect } from "@playwright/test";

/**
 * Landing page smoke test. Confirms the page loads and the hero + feature
 * carousel render. Does NOT trigger AI career search (keys may be absent).
 */
test.describe("Landing page", () => {
  test("loads with hero search and feature carousel", async ({ page }) => {
    await page.goto("/");

    // Hero search box (no submission — avoids the AI route).
    await expect(page.getByRole("searchbox").first()).toBeVisible();

    // Feature carousel section + at least one feature card heading.
    const features = page.locator("#features");
    await expect(features).toBeVisible();
    await expect(
      features.getByText("The secret sauce, not just job descriptions", { exact: false })
    ).toBeVisible();
  });
});
