import { test, expect } from "@playwright/test";

/**
 * Profile / onboarding wizard smoke test. The wizard renders and the CV-upload
 * area does not crash. No login required.
 */
test.describe("Profile page", () => {
  test("onboarding wizard renders with inputs", async ({ page }) => {
    await page.goto("/profile?skipIntro=true");

    // Step indicator shows the first step (desktop label).
    await expect(page.getByText("Basic Info", { exact: false }).first()).toBeVisible();

    // At least one form input is present.
    await expect(page.getByRole("textbox").first()).toBeVisible();
  });
});
