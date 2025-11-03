import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Component Object Model for Delete Word Dialog
 * Handles word deletion confirmation
 */
export class DeleteWordDialogComponent extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators
  get dialog() {
    return this.getByTestId('delete-word-dialog');
  }

  get dialogTitle() {
    return this.getByTestId('delete-word-dialog-title');
  }

  get dialogDescription() {
    return this.getByTestId('delete-word-dialog-description');
  }

  get wordName() {
    return this.getByTestId('delete-word-name');
  }

  get cancelButton() {
    return this.getByTestId('delete-word-cancel-button');
  }

  get confirmButton() {
    return this.getByTestId('delete-word-confirm-button');
  }

  // Actions
  async waitForDialog(): Promise<void> {
    await this.waitForElement('delete-word-dialog');
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async clickConfirm(): Promise<void> {
    await this.confirmButton.click();
  }

  async confirmDeletion(): Promise<void> {
    await this.waitForDialog();
    await this.clickConfirm();
  }

  async cancelDeletion(): Promise<void> {
    await this.waitForDialog();
    await this.clickCancel();
  }

  // Assertions
  async expectDialogVisible(): Promise<void> {
    await expect(this.dialog).toBeVisible();
    await expect(this.dialogTitle).toBeVisible();
    await expect(this.dialogDescription).toBeVisible();
  }

  async expectDialogHidden(): Promise<void> {
    await expect(this.dialog).not.toBeVisible();
  }

  async expectWordName(word: string): Promise<void> {
    await expect(this.wordName).toContainText(word);
  }
}




