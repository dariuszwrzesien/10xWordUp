import { Page, Locator } from "@playwright/test";

/**
 * Base Page Object Class
 * Provides common functionality for all page objects
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Get element by data-testid attribute
   */
  getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  /**
   * Navigate to a specific URL
   */
  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Wait for page to load
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState("domcontentloaded");
  }

  /**
   * Get current URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Check if element is visible
   */
  async isVisible(testId: string): Promise<boolean> {
    return await this.getByTestId(testId).isVisible();
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(testId: string): Promise<void> {
    await this.getByTestId(testId).waitFor({ state: "visible" });
  }
}
