import { expect } from "@playwright/test";
import { BasePage } from "./base.page";

/**
 * Page Object Model for Forgot Password Page
 * Handles password reset request flow
 */
export class ForgotPasswordPage extends BasePage {
  // Locators - Form State
  get formCard() {
    return this.getByTestId("forgot-password-form-card");
  }

  get form() {
    return this.getByTestId("forgot-password-form");
  }

  get emailInput() {
    return this.getByTestId("forgot-password-email-input");
  }

  get emailError() {
    return this.getByTestId("forgot-password-email-error");
  }

  get submitButton() {
    return this.getByTestId("forgot-password-submit-button");
  }

  get loginLink() {
    return this.getByTestId("forgot-password-login-link");
  }

  // Locators - Success State
  get successCard() {
    return this.getByTestId("forgot-password-success-card");
  }

  get successMessage() {
    return this.getByTestId("forgot-password-success-message");
  }

  get resendButton() {
    return this.getByTestId("forgot-password-resend-button");
  }

  get backToLoginLink() {
    return this.getByTestId("forgot-password-back-to-login-link");
  }

  // Actions
  async navigate(): Promise<void> {
    await this.goto("/forgot-password");
    await this.waitForElement("forgot-password-form-card");
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
  }

  async clickResend(): Promise<void> {
    await this.resendButton.click();
  }

  async clickBackToLogin(): Promise<void> {
    await this.backToLoginLink.click();
  }

  async requestPasswordReset(email: string): Promise<void> {
    await this.fillEmail(email);
    await this.clickSubmit();
  }

  // Assertions
  async expectFormVisible(): Promise<void> {
    await expect(this.formCard).toBeVisible();
    await expect(this.emailInput).toBeVisible();
  }

  async expectEmailError(message?: string): Promise<void> {
    await expect(this.emailError).toBeVisible();
    if (message) {
      await expect(this.emailError).toContainText(message);
    }
  }

  async expectSuccessState(): Promise<void> {
    await expect(this.successCard).toBeVisible();
    await expect(this.successMessage).toBeVisible();
    await expect(this.resendButton).toBeVisible();
  }
}
