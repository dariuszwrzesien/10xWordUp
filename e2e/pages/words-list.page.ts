import { Page, expect, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object Model for Words List Page
 * Handles main dashboard with words management
 */
export class WordsListPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators - Main View
  get listView() {
    return this.getByTestId('words-list-view');
  }

  get wordsCount() {
    return this.getByTestId('words-count');
  }

  get addWordButton() {
    return this.getByTestId('add-word-button');
  }

  get startQuizButton() {
    return this.getByTestId('start-quiz-button');
  }

  get tagsLoading() {
    return this.getByTestId('tags-loading');
  }

  get errorState() {
    return this.getByTestId('words-error-state');
  }

  get reloadPageButton() {
    return this.getByTestId('reload-page-button');
  }

  // Locators - Empty State
  get emptyState() {
    return this.getByTestId('empty-state');
  }

  get emptyStateMessage() {
    return this.getByTestId('empty-state-message');
  }

  get addFirstWordButton() {
    return this.getByTestId('empty-state-add-first-word-button');
  }

  get emptyStateFiltered() {
    return this.getByTestId('empty-state-filtered');
  }

  // Locators - Table
  get tableLoading() {
    return this.getByTestId('words-table-loading');
  }

  get wordsTable() {
    return this.getByTestId('words-table');
  }

  // Actions
  async navigate(): Promise<void> {
    await this.goto('/');
    await this.waitForPageLoad();
  }

  async clickAddWord(): Promise<void> {
    await this.addWordButton.click();
  }

  async clickAddFirstWord(): Promise<void> {
    await this.addFirstWordButton.click();
  }

  async clickStartQuiz(): Promise<void> {
    await this.startQuizButton.click();
  }

  async clickReloadPage(): Promise<void> {
    await this.reloadPageButton.click();
  }

  async getWordsCount(): Promise<string> {
    return await this.wordsCount.textContent() || '0';
  }

  async waitForWordsToLoad(): Promise<void> {
    // Wait for either the table, empty state, or error state to be visible
    await this.page.waitForSelector(
      '[data-testid="words-table"], [data-testid="empty-state"], [data-testid="words-error-state"]', 
      { 
        state: 'visible',
        timeout: 10000 
      }
    );
  }

  // Word Row Methods
  getWordRow(wordId: string): Locator {
    return this.getByTestId(`word-row-${wordId}`);
  }

  getWordTag(tagName: string): Locator {
    return this.getByTestId(`word-tag-${tagName}`);
  }

  getPlayAudioButton(wordId: string): Locator {
    return this.getWordRow(wordId).getByTestId('play-audio-button');
  }

  getEditButton(wordId: string): Locator {
    return this.getWordRow(wordId).getByTestId('edit-word-button');
  }

  getDeleteButton(wordId: string): Locator {
    return this.getWordRow(wordId).getByTestId('delete-word-button');
  }

  async clickPlayAudio(wordId: string): Promise<void> {
    await this.getPlayAudioButton(wordId).click();
  }

  async clickEdit(wordId: string): Promise<void> {
    await this.getEditButton(wordId).click();
  }

  async clickDelete(wordId: string): Promise<void> {
    await this.getDeleteButton(wordId).click();
  }

  // Assertions
  async expectEmptyState(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
    await expect(this.emptyStateMessage).toBeVisible();
    await expect(this.addFirstWordButton).toBeVisible();
  }

  async expectEmptyFilteredState(): Promise<void> {
    await expect(this.emptyStateFiltered).toBeVisible();
  }

  async expectTableVisible(): Promise<void> {
    await expect(this.wordsTable).toBeVisible();
  }

  async expectTableLoading(): Promise<void> {
    await expect(this.tableLoading).toBeVisible();
  }

  async expectErrorState(): Promise<void> {
    await expect(this.errorState).toBeVisible();
    await expect(this.reloadPageButton).toBeVisible();
  }

  async expectWordRowVisible(wordId: string): Promise<void> {
    await expect(this.getWordRow(wordId)).toBeVisible();
  }

  async expectWordRowNotVisible(wordId: string): Promise<void> {
    await expect(this.getWordRow(wordId)).not.toBeVisible();
  }

  async expectWordsCount(count: number): Promise<void> {
    await expect(this.wordsCount).toContainText(count.toString());
  }
}

