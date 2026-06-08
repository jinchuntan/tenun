import { defineConfig, devices } from "@playwright/test";

/**
 * Lightweight smoke-test config for Tenun.
 *
 * - Boots the app with `npm run dev` and reuses an already-running server.
 * - Base URL 127.0.0.1:3000.
 * - Smoke tests use demo personas (`/dashboard?demo=<id>`) and stable UI labels,
 *   so they need NO OpenRouter / Groq / Supabase / Google login. AI-dependent
 *   responses are never asserted.
 */
const PORT = 3000;
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  timeout: 45_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    // Demo mode disables Supabase auth; no real credentials are ever used.
    locale: "en-US",
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],

  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
