import { expect } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Page Object Model for Login Page
 * Handles all interactions with the login form
 */
export class LoginPage extends BasePage {
  // Locators
  get formCard() {
    return this.getByTestId("login-form-card");
  }

  get form() {
    return this.getByTestId("login-form");
  }

  get emailInput() {
    return this.getByTestId("login-email-input");
  }

  get emailError() {
    return this.getByTestId("login-email-error");
  }

  get passwordInput() {
    return this.getByTestId("login-password-input");
  }

  get passwordError() {
    return this.getByTestId("login-password-error");
  }

  get forgotPasswordLink() {
    return this.getByTestId("login-forgot-password-link");
  }

  get submitButton() {
    return this.getByTestId("login-submit-button");
  }

  get registerLink() {
    return this.getByTestId("login-register-link");
  }

  // Actions
  async navigate(): Promise<void> {
    await this.goto("/login");
    await this.waitForElement("login-form-card");
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
  }

  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }

  async clickRegisterLink(): Promise<void> {
    await this.registerLink.click();
  }

  async login(email: string, password: string, expectSuccess = true): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickSubmit();

    // Wait for navigation after successful login
    if (expectSuccess) {
      // Wait for the success toast to appear (indicates API success)
      await this.page.getByText(/logowanie pomyślne/i).waitFor({
        state: "visible",
        timeout: 5000,
      });

      // The frontend uses setTimeout with 500ms delay before redirect
      // Wait a bit to ensure the setTimeout has triggered
      await this.page.waitForTimeout(600);

      // Now wait for the actual navigation to complete
      // Note: We don't wait for URL change here anymore - it's done in the fixture
      // This method now only ensures the login API call succeeded
    }
  }

  // Assertions
  async expectFormVisible(): Promise<void> {
    await expect(this.formCard).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
  }

  async expectEmailError(message?: string): Promise<void> {
    await expect(this.emailError).toBeVisible();
    if (message) {
      await expect(this.emailError).toContainText(message);
    }
  }

  async expectPasswordError(message?: string): Promise<void> {
    await expect(this.passwordError).toBeVisible();
    if (message) {
      await expect(this.passwordError).toContainText(message);
    }
  }

  async expectSubmitButtonDisabled(): Promise<void> {
    await expect(this.submitButton).toBeDisabled();
  }

  async expectSubmitButtonEnabled(): Promise<void> {
    await expect(this.submitButton).toBeEnabled();
  }
}
