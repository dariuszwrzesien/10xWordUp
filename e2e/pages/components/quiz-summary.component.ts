import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Component Object Model for Quiz Summary
 * Handles quiz completion and results
 */
export class QuizSummaryComponent extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators
  get summaryContainer() {
    return this.getByTestId('quiz-summary');
  }

  get title() {
    return this.getByTestId('quiz-summary-title');
  }

  get message() {
    return this.getByTestId('quiz-summary-message');
  }

  get summaryCard() {
    return this.getByTestId('quiz-summary-card');
  }

  get repeatButton() {
    return this.getByTestId('quiz-repeat-button');
  }

  get newQuizButton() {
    return this.getByTestId('quiz-new-button');
  }

  get backToWordsButton() {
    return this.getByTestId('quiz-back-to-words-button');
  }

  // Actions
  async waitForSummary(): Promise<void> {
    await this.waitForElement('quiz-summary');
  }

  async clickRepeat(): Promise<void> {
    await this.repeatButton.click();
  }

  async clickNewQuiz(): Promise<void> {
    await this.newQuizButton.click();
  }

  async clickBackToWords(): Promise<void> {
    await this.backToWordsButton.click();
  }

  async getSummaryTitle(): Promise<string> {
    return await this.title.textContent() || '';
  }

  async getSummaryMessage(): Promise<string> {
    return await this.message.textContent() || '';
  }

  // Assertions
  async expectSummaryVisible(): Promise<void> {
    await expect(this.summaryContainer).toBeVisible();
    await expect(this.title).toBeVisible();
    await expect(this.summaryCard).toBeVisible();
  }

  async expectTitle(title: string): Promise<void> {
    await expect(this.title).toContainText(title);
  }

  async expectMessage(message: string): Promise<void> {
    await expect(this.message).toContainText(message);
  }

  async expectAllButtonsVisible(): Promise<void> {
    await expect(this.repeatButton).toBeVisible();
    await expect(this.newQuizButton).toBeVisible();
    await expect(this.backToWordsButton).toBeVisible();
  }
}





