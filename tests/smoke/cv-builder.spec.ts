import { test, expect } from "@playwright/test";

/**
 * CV builder smoke test. The "create a new CV" entry route renders its first
 * step (format/style options) without a session. CV persistence (Supabase) is
 * only touched on later actions, which this smoke test does not trigger.
 */
test.describe("CV builder", () => {
  test("/dashboard/cv/new loads the first step", async ({ page }) => {
    await page.goto("/dashboard/cv/new");
    await expect(page.getByText("Create a new CV", { exact: false })).toBeVisible();
    // Format options for the first step.
    await expect(page.getByText("What are you building?", { exact: false })).toBeVisible();
  });
});
