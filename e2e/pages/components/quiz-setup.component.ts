import { expect, Locator } from "@playwright/test";
import { BasePage } from "../base.page";

/**
 * Component Object Model for Quiz Setup
 * Handles quiz configuration before starting
 */
export class QuizSetupComponent extends BasePage {
  // Locators
  get setupContainer() {
    return this.getByTestId("quiz-setup");
  }

  get backToWordsButton() {
    return this.getByTestId("quiz-back-to-words-button");
  }

  get setupCard() {
    return this.getByTestId("quiz-setup-card");
  }

  // Direction options
  get directionEnPl() {
    return this.getByTestId("quiz-direction-en-pl");
  }

  get directionPlEn() {
    return this.getByTestId("quiz-direction-pl-en");
  }

  // Scope options
  get scopeAll() {
    return this.getByTestId("quiz-scope-all");
  }

  get scopeTag() {
    return this.getByTestId("quiz-scope-tag");
  }

  // Tag selector
  get tagSelector() {
    return this.getByTestId("quiz-tag-selector");
  }

  get tagsLoading() {
    return this.getByTestId("quiz-tags-loading");
  }

  get noTagsMessage() {
    return this.getByTestId("quiz-no-tags-message");
  }

  get tagSelectTrigger() {
    return this.getByTestId("quiz-tag-select-trigger");
  }

  get tagSelectContent() {
    return this.getByTestId("quiz-tag-select-content");
  }

  // Start quiz
  get startButton() {
    return this.getByTestId("quiz-start-button");
  }

  get validationMessage() {
    return this.getByTestId("quiz-validation-message");
  }

  // Dynamic locators
  getTagOption(tagName: string): Locator {
    return this.getByTestId(`quiz-tag-option-${tagName}`);
  }

  // Actions
  async waitForSetup(): Promise<void> {
    await this.waitForElement("quiz-setup");
  }

  async clickBackToWords(): Promise<void> {
    await this.backToWordsButton.click();
  }

  async selectDirectionEnPl(): Promise<void> {
    // Click the radio button itself, not the container
    const radioButton = this.directionEnPl.locator('button[role="radio"]');
    await radioButton.click();
  }

  async selectDirectionPlEn(): Promise<void> {
    // Click the radio button itself, not the container
    const radioButton = this.directionPlEn.locator('button[role="radio"]');
    await radioButton.click();
  }

  async selectScopeAll(): Promise<void> {
    // Click the radio button itself, not the container
    const radioButton = this.scopeAll.locator('button[role="radio"]');
    await radioButton.click();
  }

  async selectScopeTag(): Promise<void> {
    // Click the radio button itself, not the container
    const radioButton = this.scopeTag.locator('button[role="radio"]');
    await radioButton.click();
  }

  async openTagSelector(): Promise<void> {
    await this.tagSelectTrigger.click();
    await this.waitForElement("quiz-tag-select-content");
  }

  async selectTag(tagName: string): Promise<void> {
    await this.openTagSelector();
    await this.getTagOption(tagName).click();
  }

  async clickStart(): Promise<void> {
    // Ensure button is enabled before clicking
    await expect(this.startButton).toBeEnabled();
    await this.startButton.click();

    // Wait for setup to start disappearing (transition to loading state)
    await this.setupContainer.waitFor({ state: "hidden", timeout: 5000 });
  }

  async setupQuiz(direction: "en-pl" | "pl-en", scope: "all" | "tag", tagName?: string): Promise<void> {
    // Select direction
    if (direction === "en-pl") {
      await this.selectDirectionEnPl();
    } else {
      await this.selectDirectionPlEn();
    }

    // Select scope
    if (scope === "all") {
      await this.selectScopeAll();
    } else {
      await this.selectScopeTag();
      if (tagName) {
        await this.selectTag(tagName);
      }
    }

    await this.clickStart();
  }

  // Assertions
  async expectSetupVisible(): Promise<void> {
    await expect(this.setupContainer).toBeVisible();
    await expect(this.setupCard).toBeVisible();
  }

  async expectDirectionSelected(direction: "en-pl" | "pl-en"): Promise<void> {
    const directionContainer = direction === "en-pl" ? this.directionEnPl : this.directionPlEn;
    // Find the RadioGroupItem (button with role="radio") inside the container
    const radioButton = directionContainer.locator('button[role="radio"]');
    await expect(radioButton).toHaveAttribute("data-state", "checked");
  }

  async expectScopeSelected(scope: "all" | "tag"): Promise<void> {
    const scopeContainer = scope === "all" ? this.scopeAll : this.scopeTag;
    // Find the RadioGroupItem (button with role="radio") inside the container
    const radioButton = scopeContainer.locator('button[role="radio"]');
    await expect(radioButton).toHaveAttribute("data-state", "checked");
  }

  async expectTagSelectorVisible(): Promise<void> {
    await expect(this.tagSelector).toBeVisible();
  }

  async expectTagSelectorHidden(): Promise<void> {
    await expect(this.tagSelector).not.toBeVisible();
  }

  async expectNoTagsMessage(): Promise<void> {
    await expect(this.noTagsMessage).toBeVisible();
  }

  async expectTagsLoading(): Promise<void> {
    await expect(this.tagsLoading).toBeVisible();
  }

  async expectValidationMessage(message?: string): Promise<void> {
    await expect(this.validationMessage).toBeVisible();
    if (message) {
      await expect(this.validationMessage).toContainText(message);
    }
  }

  async expectStartButtonDisabled(): Promise<void> {
    await expect(this.startButton).toBeDisabled();
  }

  async expectStartButtonEnabled(): Promise<void> {
    await expect(this.startButton).toBeEnabled();
  }
}
