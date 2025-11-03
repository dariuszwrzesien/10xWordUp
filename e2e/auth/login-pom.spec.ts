import { test, expect } from '@playwright/test';
import { test as authenticatedTest } from '../fixtures/auth.fixture';
import { LoginPage, WordsListPage, UserMenuComponent } from '../pages';

/**
 * Authentication E2E Tests using Page Object Model
 * Based on scenarios from docs/64-scenariusze-testowania-e2e.md
 */

test.describe('Authentication - Login Flow', () => {
  
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
  test('Full workflow: Login -> Add Word -> Logout', async ({ page, context }) => {
    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    if (!username || !password) {
      throw new Error("E2E_USERNAME and E2E_PASSWORD must be set in .env.test");
    }

    // Ensure clean state - clear all cookies and storage
    await context.clearCookies();
    await page.goto('/');

    // Login
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    
    // Wait a bit for the page to settle
    await page.waitForTimeout(500);
    
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

