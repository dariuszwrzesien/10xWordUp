/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, expect } from "@playwright/test";
import { LoginPage } from "../pages";

/**
 * Fixture for authenticated user with proper test isolation
 *
 * This fixture ensures each test has its own isolated browser context
 * with a fresh authentication session. This prevents race conditions
 * and session conflicts when running tests in parallel.
 *
 * Key improvements for test isolation:
 * - Each test gets a fresh browser context (isolated cookies/storage)
 * - Authentication happens per-test, not shared across tests
 * - Proper cleanup in finally block ensures no state leaks
 * - Works correctly with parallel test execution
 *
 * Usage:
 * import { test, expect } from './fixtures/auth.fixture';
 *
 * test('my authenticated test', async ({ page, authenticatedUser }) => {
 *   // User is already logged in in isolated context
 *   // page is automatically provided by the fixture
 *   await page.goto('/');
 *   // ... rest of test
 * });
 */

interface AuthenticatedUser {
  email: string;
  password: string;
  id?: string;
}

export const test = base.extend<{
  authenticatedUser: AuthenticatedUser;
}>({
  // Override context to provide fresh isolated context per test
  // This ensures complete isolation from other parallel tests
  context: async ({ browser }, use) => {
    const context = await browser.newContext({
      // Start with clean storage state - no cookies, no localStorage
      storageState: { cookies: [], origins: [] },
    });
    await use(context);
    await context.close();
  },

  // Override page to use the isolated context
  page: async ({ context }, use) => {
    const page = await context.newPage();
    await use(page);
  },

  // Authenticate user before test runs
  authenticatedUser: async ({ page }, use) => {
    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;
    const userId = process.env.E2E_USERNAME_ID;

    if (!username || !password) {
      throw new Error("E2E_USERNAME and E2E_PASSWORD must be set in .env.test");
    }

    const user: AuthenticatedUser = {
      email: username,
      password: password,
      id: userId,
    };

    // Perform login in this isolated context
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(user.email, user.password);

    // Wait for successful login (redirect to home page)
    // Extended timeout to handle Supabase session establishment
    await page.waitForURL("/", {
      timeout: 15000,
      waitUntil: "load",
    });

    // Additional wait to ensure session is fully established
    // This is critical because Supabase needs time to set auth cookies
    // and the middleware needs to recognize the session
    await page.waitForLoadState("networkidle", { timeout: 5000 });

    // Verify we're actually on the home page with authenticated session
    // by checking for authenticated content (words list view)
    await page.waitForSelector('[data-testid="words-list-view"]', {
      state: "visible",
      timeout: 5000,
    });

    // Pass the authenticated user info to the test
    await use(user);

    // Cleanup is handled by context and page fixtures
  },
});

export { expect };
