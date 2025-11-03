import { BasePage } from "./base.page";

/**
 * Page Object Model for Quiz Page
 * Handles quiz setup, session, and summary
 */
export class QuizPage extends BasePage {
  // Navigation
  async navigate(): Promise<void> {
    await this.goto("/quiz");
    await this.waitForPageLoad();
  }

  // Check quiz state
  async isSetupState(): Promise<boolean> {
    return await this.isVisible("quiz-setup");
  }

  async isSessionState(): Promise<boolean> {
    return await this.isVisible("quiz-session");
  }

  async isSummaryState(): Promise<boolean> {
    return await this.isVisible("quiz-summary");
  }
}
