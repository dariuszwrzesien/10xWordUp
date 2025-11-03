import { test, expect } from '@playwright/test';
import { test as authenticatedTest } from '../fixtures/auth.fixture';
import { LoginPage, WordsListPage, UserMenuComponent } from '../pages';

/**
 * Authentication E2E Tests using Page Object Model
 * Based on scenarios from docs/64-scenariusze-testowania-e2e.md
 * 
 * Test Isolation Strategy:
 * - Login/Logout tests use test.use({ storageState: { cookies: [], origins: [] } })
 *   to ensure each test starts with no authentication state
 * - This prevents auth state from leaking between parallel test runs
 * - Each test gets a fresh browser context with clean storage
 */

test.describe('Authentication - Login Flow', () => {
  // Ensure isolated state for each test - no auth cookies/storage
  test.use({ storageState: { cookies: [], origins: [] } });
  
  test('TC-AUTH-005: Successful login with valid credentials', async ({ page }) => {
    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    if (!username || !password) {
      throw new Error("E2E_USERNAME and E2E_PASSWORD must be set in .env.test");
    }

    const loginPage = new LoginPage(page);
    const wordsListPage = new WordsListPage(page);
    const userMenu = new UserMenuComponent(page);

    // Navigate to login page
    await loginPage.navigate();
    await loginPage.expectFormVisible();

    // Perform login
    await loginPage.login(username, password);

    // Wait for redirect and session establishment
    await page.waitForURL('/', { 
      timeout: 15000,
      waitUntil: 'load' 
    });
    await page.waitForLoadState('networkidle', { timeout: 5000 });

    // Verify successful login
    await expect(page).toHaveURL('/');
    await userMenu.expectMenuVisible();
    await userMenu.expectUserEmail(username);
  });

  test('TC-AUTH-006: Login with incorrect password', async ({ page }) => {
    const username = process.env.E2E_USERNAME;

    if (!username) {
      throw new Error("E2E_USERNAME must be set in .env.test");
    }

    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.login(username, 'wrongpassword', false);

    // Should stay on login page with error
    await expect(page).toHaveURL('/login');
    // Add assertion for error message once implemented
  });

  test('TC-AUTH-007: Login with unregistered email', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.login('nonexistent@example.com', 'password123', false);

    // Should stay on login page with error
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Authentication - Logout Flow', () => {

  authenticatedTest('TC-AUTH-008: Successful logout', async ({ page, authenticatedUser }) => {
    // Scenario: TC-AUTH-008 from docs/64-scenariusze-testowania-e2e.md
    // Steps:
    // 1. User is logged in and on dashboard
    // 2. User clicks on UserMenu in header
    // 3. User selects "Logout" from dropdown menu
    // 4. System calls /api/auth/logout endpoint
    // 5. System removes session in Supabase Auth
    // 6. Middleware redirects to /login
    //
    // Expected results:
    // - Toast notification: "Wylogowano pomyślnie" (if implemented)
    // - Session token is removed
    // - User is redirected to /login
    // - No access to protected routes without login
    
    const userMenu = new UserMenuComponent(page);
    const loginPage = new LoginPage(page);

    // Verify user is on dashboard and logged in
    await expect(page).toHaveURL('/');
    await userMenu.expectMenuVisible();
    await userMenu.expectUserEmail(authenticatedUser.email);

    // Perform logout through user menu
    await userMenu.logout();

    // Verify redirect to login page
    await expect(page).toHaveURL('/login');
    await loginPage.expectFormVisible();

    // Verify no UserMenu is visible (user is logged out)
    await expect(userMenu.menuTrigger).not.toBeVisible();

    // Verify protected route access is blocked (middleware redirect)
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Authentication - Navigation Links', () => {

  test('Should navigate from login to register page', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.clickRegisterLink();

    await expect(page).toHaveURL('/register');
  });

  test('Should navigate from login to forgot password page', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.clickForgotPassword();

    await expect(page).toHaveURL('/forgot-password');
  });
});

test.describe('Authentication - Complete User Flow', () => {
  // Ensure isolated state for each test - fresh browser context with no stored auth
  test.use({ storageState: { cookies: [], origins: [] } });
  
  // Ensure clean state before each test
  test.beforeEach(async ({ context, page }) => {
    // Clear all cookies and storage to ensure clean state
    await context.clearCookies();
    
    // Navigate to a page to execute storage clearing
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Ensure cookies are really cleared by reloading
    await page.reload();
    
    // Wait for page to fully load after reload
    await page.waitForLoadState('networkidle');
  });

  test('Full workflow: Login -> Add Word -> Logout', async ({ page, context }) => {
    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    if (!username || !password) {
      throw new Error("E2E_USERNAME and E2E_PASSWORD must be set in .env.test");
    }

    // We're already on /login from beforeEach
    // Create page objects
    const loginPage = new LoginPage(page);
    
    // Wait for login form to be visible (ensure we're not being redirected)
    await loginPage.expectFormVisible();
    
    await loginPage.login(username, password);

    // Verify user is logged in
    const wordsListPage = new WordsListPage(page);
    const userMenu = new UserMenuComponent(page);
    
    await expect(page).toHaveURL('/');
    await userMenu.expectMenuVisible();
    await userMenu.expectUserEmail(username);

    // Logout
    await userMenu.logout();

    // Verify logged out
    await expect(page).toHaveURL('/login');
  });
});

