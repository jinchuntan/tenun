import { test, expect } from "@playwright/test";

/**
 * Employer pages smoke test. Public marketing + candidate dashboard render
 * without login or backend data.
 */
test.describe("Employer pages", () => {
  test("employer landing loads", async ({ page }) => {
    await page.goto("/employers");
    await expect(
      page.getByText("Hire candidates who already know", { exact: false })
    ).toBeVisible();
  });

  test("employer candidate dashboard loads", async ({ page }) => {
    await page.goto("/employers/dashboard?role=Data%20Analyst%20Intern");
    await expect(
      page.getByRole("heading", { name: "Employer Candidate Dashboard" })
    ).toBeVisible();
    // Stable search affordance.
    await expect(
      page.getByLabel("Search candidates by role or skills")
    ).toBeVisible();
  });
});
