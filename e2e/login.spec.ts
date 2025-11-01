import { test, expect, Page } from '@playwright/test';

/**
 * Page Object Model for the Login Page
 * This pattern helps maintain tests by centralizing element locators
 * and actions in a single place.
 */
class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/login');
  }

  async fillEmail(email: string) {
    await this.page.getByLabel(/email/i).fill(email);
  }

  async fillPassword(password: string) {
    await this.page.getByLabel(/password/i).fill(password);
  }

  async clickLoginButton() {
    await this.page.getByRole('button', { name: /login|sign in/i }).click();
  }

  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLoginButton();
  }
}

test.describe('Login Page', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should display login form', async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /login|sign in/i })).toBeVisible();
  });

  test('should show validation error for empty fields', async ({ page }) => {
    await loginPage.clickLoginButton();
    // Add your specific validation error checks here
    // Example: await expect(page.getByText(/email is required/i)).toBeVisible();
  });

  test.skip('should login successfully with valid credentials', async ({ page }) => {
    // This test is skipped by default - update with real test user credentials
    await loginPage.login('test@example.com', 'testpassword123');
    
    // Wait for navigation to dashboard/home after successful login
    await expect(page).toHaveURL(/\/(dashboard|home|words)/);
  });
});


