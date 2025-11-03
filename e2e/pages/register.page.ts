import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object Model for Register Page
 * Handles all interactions with the registration form
 */
export class RegisterPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators
  get formCard() {
    return this.getByTestId('register-form-card');
  }

  get form() {
    return this.getByTestId('register-form');
  }

  get emailInput() {
    return this.getByTestId('register-email-input');
  }

  get emailError() {
    return this.getByTestId('register-email-error');
  }

  get passwordInput() {
    return this.getByTestId('register-password-input');
  }

  get passwordError() {
    return this.getByTestId('register-password-error');
  }

  get confirmPasswordInput() {
    return this.getByTestId('register-confirm-password-input');
  }

  get confirmPasswordError() {
    return this.getByTestId('register-confirm-password-error');
  }

  get submitButton() {
    return this.getByTestId('register-submit-button');
  }

  get loginLink() {
    return this.getByTestId('register-login-link');
  }

  // Actions
  async navigate(): Promise<void> {
    await this.goto('/register');
    await this.waitForElement('register-form-card');
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
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

  async clickLoginLink(): Promise<void> {
    await this.loginLink.click();
  }

  async register(email: string, password: string, confirmPassword: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.fillConfirmPassword(confirmPassword);
    await this.clickSubmit();
  }

  // Assertions
  async expectFormVisible(): Promise<void> {
    await expect(this.formCard).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.confirmPasswordInput).toBeVisible();
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

  async expectConfirmPasswordError(message?: string): Promise<void> {
    await expect(this.confirmPasswordError).toBeVisible();
    if (message) {
      await expect(this.confirmPasswordError).toContainText(message);
    }
  }

  async expectSubmitButtonDisabled(): Promise<void> {
    await expect(this.submitButton).toBeDisabled();
  }

  async expectSubmitButtonEnabled(): Promise<void> {
    await expect(this.submitButton).toBeEnabled();
  }
}



