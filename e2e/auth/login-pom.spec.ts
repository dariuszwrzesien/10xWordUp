import { test, expect } from '@playwright/test';
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

  test.skip('TC-AUTH-008: Successful logout', async ({ page }) => {
    // This test requires authenticated state
    // Use auth.fixture.ts to setup authenticated user
    
    const wordsListPage = new WordsListPage(page);
    const userMenu = new UserMenuComponent(page);
    const loginPage = new LoginPage(page);

    // Navigate to dashboard (user should be logged in)
    await wordsListPage.navigate();
    await userMenu.expectMenuVisible();

    // Perform logout
    await userMenu.logout();

    // Verify redirect to login
    await expect(page).toHaveURL('/login');
    await loginPage.expectFormVisible();
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

