import { expect, Locator } from "@playwright/test";
import { BasePage } from "../base.page";

/**
 * Component Object Model for Tag Filter
 * Handles filtering words by tags
 */
export class TagFilterComponent extends BasePage {
  // Locators
  get filterTrigger() {
    return this.getByTestId("tag-filter-trigger");
  }

  get filterContent() {
    return this.getByTestId("tag-filter-content");
  }

  get allWordsOption() {
    return this.getByTestId("tag-filter-all");
  }

  // Dynamic locators
  getTagOption(tagName: string): Locator {
    return this.getByTestId(`tag-filter-${tagName}`);
  }

  // Actions
  async openFilter(): Promise<void> {
    await this.filterTrigger.click();
    await this.waitForElement("tag-filter-content");
  }

  async closeFilter(): Promise<void> {
    await this.page.keyboard.press("Escape");
  }

  async selectAllWords(): Promise<void> {
    await this.openFilter();
    await this.allWordsOption.click();
  }

  async selectTag(tagName: string): Promise<void> {
    await this.openFilter();
    await this.getTagOption(tagName).click();
  }

  async getSelectedFilterText(): Promise<string> {
    return (await this.filterTrigger.textContent()) || "";
  }

  // Assertions
  async expectFilterVisible(): Promise<void> {
    await expect(this.filterTrigger).toBeVisible();
  }

  async expectFilterOpened(): Promise<void> {
    await expect(this.filterContent).toBeVisible();
    await expect(this.allWordsOption).toBeVisible();
  }

  async expectFilterClosed(): Promise<void> {
    await expect(this.filterContent).not.toBeVisible();
  }

  async expectTagOption(tagName: string): Promise<void> {
    await this.openFilter();
    await expect(this.getTagOption(tagName)).toBeVisible();
  }

  async expectSelectedFilter(text: string): Promise<void> {
    await expect(this.filterTrigger).toContainText(text);
  }
}
