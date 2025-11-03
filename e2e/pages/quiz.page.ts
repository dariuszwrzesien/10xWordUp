import { Page, expect, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object Model for Quiz Page
 * Handles quiz setup, session, and summary
 */
export class QuizPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Navigation
  async navigate(): Promise<void> {
    await this.goto('/quiz');
    await this.waitForPageLoad();
  }

  // Check quiz state
  async isSetupState(): Promise<boolean> {
    return await this.isVisible('quiz-setup');
  }

  async isSessionState(): Promise<boolean> {
    return await this.isVisible('quiz-session');
  }

  async isSummaryState(): Promise<boolean> {
    return await this.isVisible('quiz-summary');
  }
}





