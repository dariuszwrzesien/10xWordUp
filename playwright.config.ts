import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

// Load .env.test only if not in CI environment
// In CI (GitHub Actions), environment variables are provided via secrets
if (!process.env.CI) {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });
}

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  /* IMPORTANT: Using 1 worker to prevent race conditions with shared test user data.
   * All tests use the same E2E_USERNAME_ID, so parallel execution causes data conflicts.
   * TODO: Implement per-test user isolation or database locking for parallel execution.
   */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:3000",
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    /* Screenshot on failure */
    screenshot: "only-on-failure",
  },
  /* Make environment variables available to tests */
  env: {
    E2E_USERNAME: process.env.E2E_USERNAME || "",
    E2E_PASSWORD: process.env.E2E_PASSWORD || "",
    E2E_USERNAME_ID: process.env.E2E_USERNAME_ID || "",
    SUPABASE_URL: process.env.SUPABASE_URL || "",
    SUPABASE_KEY: process.env.SUPABASE_KEY || "",
  },

  /* Global teardown - runs once after all tests complete */
  globalTeardown: path.resolve(process.cwd(), "./e2e/global-teardown.ts"),

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run dev:e2e",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
