import { Page, expect, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Component Object Model for Word Form Dialog
 * Handles adding and editing words
 */
export class WordFormDialogComponent extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators
  get dialog() {
    return this.getByTestId('word-form-dialog');
  }

  get dialogTitle() {
    return this.getByTestId('word-form-dialog-title');
  }

  get form() {
    return this.getByTestId('word-form');
  }

  get wordInput() {
    return this.getByTestId('word-input');
  }

  get wordError() {
    return this.getByTestId('word-error');
  }

  get translationInput() {
    return this.getByTestId('translation-input');
  }

  get translationError() {
    return this.getByTestId('translation-error');
  }

  get tagInput() {
    return this.getByTestId('tag-input');
  }

  get addTagButton() {
    return this.getByTestId('add-tag-button');
  }

  get selectedTags() {
    return this.getByTestId('selected-tags');
  }

  get availableTags() {
    return this.getByTestId('available-tags');
  }

  get cancelButton() {
    return this.getByTestId('word-form-cancel-button');
  }

  get submitButton() {
    return this.getByTestId('word-form-submit-button');
  }

  // Tag-specific locators
  getSelectedTag(tagName: string): Locator {
    return this.getByTestId(`selected-tag-${tagName}`);
  }

  getRemoveTagButton(tagName: string): Locator {
    return this.getByTestId(`remove-tag-${tagName}`);
  }

  getAvailableTag(tagName: string): Locator {
    return this.getByTestId(`available-tag-${tagName}`);
  }

  // Actions
  async waitForDialog(): Promise<void> {
    // Wait for dialog with a longer timeout since it's rendered in a portal
    await this.page.waitForSelector('[data-testid="word-form-dialog"]', {
      state: 'visible',
      timeout: 10000
    });
  }

  async fillWord(word: string): Promise<void> {
    await this.wordInput.fill(word);
  }

  async fillTranslation(translation: string): Promise<void> {
    await this.translationInput.fill(translation);
  }

  async fillTagInput(tagName: string): Promise<void> {
    await this.tagInput.fill(tagName);
  }

  async clickAddTag(): Promise<void> {
    await this.addTagButton.click();
  }

  async addTag(tagName: string): Promise<void> {
    await this.fillTagInput(tagName);
    await this.clickAddTag();
  }

  async selectAvailableTag(tagName: string): Promise<void> {
    await this.getAvailableTag(tagName).click();
  }

  async removeTag(tagName: string): Promise<void> {
    await this.getRemoveTagButton(tagName).click();
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
  }

  async fillWordForm(word: string, translation: string, tags?: string[]): Promise<void> {
    await this.fillWord(word);
    await this.fillTranslation(translation);
    
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        await this.addTag(tag);
      }
    }
  }

  async createWord(word: string, translation: string, tags?: string[]): Promise<void> {
    await this.waitForDialog();
    await this.fillWordForm(word, translation, tags);
    await this.clickSubmit();
  }

  async editWord(word?: string, translation?: string, tags?: string[]): Promise<void> {
    if (word) await this.fillWord(word);
    if (translation) await this.fillTranslation(translation);
    
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        await this.addTag(tag);
      }
    }
    
    await this.clickSubmit();
  }

  // Assertions
  async expectDialogVisible(): Promise<void> {
    await this.waitForDialog();
    await expect(this.dialog).toBeVisible();
  }

  async expectDialogHidden(): Promise<void> {
    await expect(this.dialog).not.toBeVisible();
  }

  async expectDialogTitle(title: string): Promise<void> {
    await expect(this.dialogTitle).toContainText(title);
  }

  async expectWordError(message?: string): Promise<void> {
    await expect(this.wordError).toBeVisible();
    if (message) {
      await expect(this.wordError).toContainText(message);
    }
  }

  async expectTranslationError(message?: string): Promise<void> {
    await expect(this.translationError).toBeVisible();
    if (message) {
      await expect(this.translationError).toContainText(message);
    }
  }

  async expectTagSelected(tagName: string): Promise<void> {
    await expect(this.getSelectedTag(tagName)).toBeVisible();
  }

  async expectTagNotSelected(tagName: string): Promise<void> {
    await expect(this.getSelectedTag(tagName)).not.toBeVisible();
  }

  async expectAvailableTag(tagName: string): Promise<void> {
    await expect(this.getAvailableTag(tagName)).toBeVisible();
  }

  async expectSubmitButtonDisabled(): Promise<void> {
    await expect(this.submitButton).toBeDisabled();
  }

  async expectSubmitButtonEnabled(): Promise<void> {
    await expect(this.submitButton).toBeEnabled();
  }
}


