import { expect } from "@playwright/test";
import { BasePage } from "../base.page";

/**
 * Component Object Model for Quiz Session
 * Handles active quiz session with progress tracking
 */
export class QuizSessionComponent extends BasePage {
  // Locators
  get sessionContainer() {
    return this.getByTestId("quiz-session");
  }

  get progressText() {
    return this.getByTestId("quiz-progress-text");
  }

  get progressPercent() {
    return this.getByTestId("quiz-progress-percent");
  }

  get progressBar() {
    return this.getByTestId("quiz-progress-bar");
  }

  get quitButton() {
    return this.getByTestId("quiz-quit-button");
  }

  get directionDisplay() {
    return this.getByTestId("quiz-direction-display");
  }

  get questionNumber() {
    return this.getByTestId("quiz-question-number");
  }

  get remainingQuestions() {
    return this.getByTestId("quiz-remaining-questions");
  }

  // Actions
  async waitForSession(): Promise<void> {
    // Wait for loading spinner to disappear first (if present)
    const loadingSpinner = this.page.locator("[data-testid], h3").filter({ hasText: "Przygotowuję quiz..." });
    try {
      await loadingSpinner.waitFor({ state: "hidden", timeout: 5000 });
    } catch {
      // Loading spinner might not appear if state transition is fast
    }

    // Wait for session with longer timeout as it involves API calls and state transitions
    // Use a more robust selector that waits for the element to be attached and visible
    await this.page.waitForSelector('[data-testid="quiz-session"]', {
      state: "visible",
      timeout: 15000, // Longer timeout to account for API fetch, state transitions, and React hydration
    });
  }

  async clickQuit(): Promise<void> {
    await this.quitButton.click();
  }

  async getProgressText(): Promise<string> {
    return (await this.progressText.textContent()) || "";
  }

  async getProgressPercent(): Promise<string> {
    return (await this.progressPercent.textContent()) || "";
  }

  async getQuestionNumber(): Promise<string> {
    return (await this.questionNumber.textContent()) || "";
  }

  async getRemainingQuestions(): Promise<string> {
    return (await this.remainingQuestions.textContent()) || "";
  }

  // Assertions
  async expectSessionVisible(): Promise<void> {
    await expect(this.sessionContainer).toBeVisible();
    await expect(this.progressBar).toBeVisible();
  }

  async expectProgress(current: number, total: number): Promise<void> {
    await expect(this.progressText).toContainText(`${current}/${total}`);
  }

  async expectProgressPercent(percent: number): Promise<void> {
    await expect(this.progressPercent).toContainText(`${percent}%`);
  }

  async expectDirection(direction: string): Promise<void> {
    await expect(this.directionDisplay).toContainText(direction);
  }

  async expectQuestionNumber(number: number): Promise<void> {
    await expect(this.questionNumber).toContainText(`${number}`);
  }
}
