import { test, expect } from "@playwright/test";

/**
 * Demo profile load flow. Clicking "Load demo profile (Aisha Lim)" must fill the
 * WHOLE wizard — not just the dashboard-facing fields — so the form never looks
 * half-empty. No login / AI / Supabase required (demo data is local + fictional).
 */
test.describe("Profile demo load", () => {
  test("fills every step of the wizard with Aisha's data", async ({ page }) => {
    await page.goto("/profile");

    await page.getByRole("button", { name: /Load demo profile/i }).click();

    // ── Step 1: Basic Information ──
    await expect(page.getByPlaceholder("e.g. Aisha Lim")).toHaveValue("Aisha Lim");
    await expect(page.getByPlaceholder("Mobile Number")).toHaveValue("12-345 6789");
    await expect(page.getByPlaceholder("e.g. aishalim@gmail.com")).toHaveValue(
      "aisha.lim@example.com"
    );
    await expect(page.getByPlaceholder("e.g. UX Designer")).toHaveValue(
      "Final-year Computer Science Student"
    );
    await expect(
      page.getByPlaceholder("Write a brief introduction to tell who you are")
    ).toHaveValue(/Computer Science/);

    // ── Step 2: Education & Experiences ──
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByPlaceholder("e.g. Universiti Malaya").first()).toHaveValue(
      "University of Melbourne"
    );
    await expect(page.getByPlaceholder("e.g. Computer Science").first()).toHaveValue(
      "Computer Science"
    );
    await expect(page.getByPlaceholder("e.g. Tenun").first()).toHaveValue("Deloitte");

    // ── Step 3: Skills & Interest ──
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByText("Python", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Product Management", { exact: true }).first()).toBeVisible();

    // ── Step 4: Preferences ──
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByPlaceholder("e.g. RM5,000 - RM8,000")).toHaveValue(
      "AUD $70,000 - $90,000"
    );
    await expect(page.getByText("Melbourne", { exact: true }).first()).toBeVisible();

    // The "Start Weaving" submit button is enabled (name + current role present).
    await expect(page.getByRole("button", { name: "Start Weaving" })).toBeEnabled();
  });
});
