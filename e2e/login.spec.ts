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
    await this.page.getByTestId('login-email-input').fill(email);
  }

  async fillPassword(password: string) {
    await this.page.getByTestId('login-password-input').fill(password);
  }

  async clickLoginButton() {
    await this.page.getByTestId('login-submit-button').click();
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
    await expect(page.getByTestId('login-email-input')).toBeVisible();
    await expect(page.getByTestId('login-password-input')).toBeVisible();
    await expect(page.getByTestId('login-submit-button')).toBeVisible();
  });

  test('should show validation error for empty fields', async ({ page }) => {
    await loginPage.clickLoginButton();
    // Add your specific validation error checks here
    // Example: await expect(page.getByText(/email is required/i)).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    if (!username || !password) {
      throw new Error("E2E_USERNAME and E2E_PASSWORD must be set in .env.test");
    }

    await loginPage.login(username, password);
    
    // Wait for the success toast to appear
    await expect(page.getByText(/logowanie pomyślne/i)).toBeVisible();
    
    // Wait for navigation to complete after successful login
    // The LoginForm has a 500ms delay before redirecting to "/"
    await page.waitForURL(/\/(dashboard|home|words)?$/, { timeout: 10000 });
    
    // Verify we're no longer on the login page
    await expect(page).toHaveURL(/\/(dashboard|home|words)?$/);
  });
});


