import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages';

/**
 * Fixture for authenticated user
 * This allows you to reuse authentication state across tests
 * 
 * Usage:
 * import { test, expect } from './fixtures/auth.fixture';
 * 
 * test('my authenticated test', async ({ page, authenticatedUser }) => {
 *   // User is already logged in
 *   await page.goto('/');
 *   // ... rest of test
 * });
 */

type AuthenticatedUser = {
  email: string;
  password: string;
  id?: string;
};

export const test = base.extend<{ authenticatedUser: AuthenticatedUser }>({
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

    // Perform login
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(user.email, user.password);
    
    // Wait for successful login (redirect to home page)
    await page.waitForURL('/');

    // Pass the authenticated user info to the test
    await use(user);

    // Cleanup after test (optional)
    // You can add logout logic here if needed
  },
});

export { expect };


