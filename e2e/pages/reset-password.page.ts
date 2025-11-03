import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object Model for Reset Password Page
 * Handles password reset with token
 */
export class ResetPasswordPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators - Checking State
  get checkingCard() {
    return this.getByTestId('reset-password-checking-card');
  }

  // Locators - Invalid Token State
  get invalidTokenCard() {
    return this.getByTestId('reset-password-invalid-token-card');
  }

  get invalidTokenMessage() {
    return this.getByTestId('reset-password-invalid-token-message');
  }

  get requestNewLinkButton() {
    return this.getByTestId('reset-password-request-new-link-button');
  }

  // Locators - Form State
  get formCard() {
    return this.getByTestId('reset-password-form-card');
  }

  get form() {
    return this.getByTestId('reset-password-form');
  }

  get passwordInput() {
    return this.getByTestId('reset-password-password-input');
  }

  get passwordError() {
    return this.getByTestId('reset-password-password-error');
  }

  get confirmPasswordInput() {
    return this.getByTestId('reset-password-confirm-password-input');
  }

  get confirmPasswordError() {
    return this.getByTestId('reset-password-confirm-password-error');
  }

  get submitButton() {
    return this.getByTestId('reset-password-submit-button');
  }

  get loginLink() {
    return this.getByTestId('reset-password-login-link');
  }

  get backToLoginLink() {
    return this.getByTestId('reset-password-back-to-login-link');
  }

  // Locators - Success State
  get successCard() {
    return this.getByTestId('reset-password-success-card');
  }

  get successMessage() {
    return this.getByTestId('reset-password-success-message');
  }

  get goToAppButton() {
    return this.getByTestId('reset-password-go-to-app-button');
  }

  // Actions
  async navigate(token?: string): Promise<void> {
    const url = token ? `/reset-password?token=${token}` : '/reset-password';
    await this.goto(url);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async fillConfirmPassword(password: string): Promise<void> {
    await this.confirmPasswordInput.fill(password);
  }

  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
  }

  async clickRequestNewLink(): Promise<void> {
    await this.requestNewLinkButton.click();
  }

  async clickGoToApp(): Promise<void> {
    await this.goToAppButton.click();
  }

  async resetPassword(password: string, confirmPassword: string): Promise<void> {
    await this.fillPassword(password);
    await this.fillConfirmPassword(confirmPassword);
    await this.clickSubmit();
  }

  // Assertions
  async expectCheckingState(): Promise<void> {
    await expect(this.checkingCard).toBeVisible();
  }

  async expectInvalidTokenState(): Promise<void> {
    await expect(this.invalidTokenCard).toBeVisible();
    await expect(this.invalidTokenMessage).toBeVisible();
  }

  async expectFormVisible(): Promise<void> {
    await expect(this.formCard).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.confirmPasswordInput).toBeVisible();
  }

  async expectPasswordError(message?: string): Promise<void> {
    await expect(this.passwordError).toBeVisible();
    if (message) {
      await expect(this.passwordError).toContainText(message);
    }
  }

  async expectConfirmPasswordError(message?: string): Promise<void> {
    await expect(this.confirmPasswordError).toBeVisible();
    if (message) {
      await expect(this.confirmPasswordError).toContainText(message);
    }
  }

  async expectSuccessState(): Promise<void> {
    await expect(this.successCard).toBeVisible();
    await expect(this.successMessage).toBeVisible();
    await expect(this.goToAppButton).toBeVisible();
  }
}





