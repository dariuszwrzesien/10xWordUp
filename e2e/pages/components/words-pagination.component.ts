import { Page, expect, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Component Object Model for Words Pagination
 * Handles pagination navigation
 */
export class WordsPaginationComponent extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators
  get pagination() {
    return this.getByTestId('words-pagination');
  }

  get previousButton() {
    return this.getByTestId('pagination-previous');
  }

  get nextButton() {
    return this.getByTestId('pagination-next');
  }

  // Dynamic locators
  getPageButton(pageNumber: number): Locator {
    return this.getByTestId(`pagination-page-${pageNumber}`);
  }

  // Actions
  async clickPrevious(): Promise<void> {
    await this.previousButton.click();
  }

  async clickNext(): Promise<void> {
    await this.nextButton.click();
  }

  async goToPage(pageNumber: number): Promise<void> {
    await this.getPageButton(pageNumber).click();
  }

  async isPreviousDisabled(): Promise<boolean> {
    const ariaDisabled = await this.previousButton.getAttribute('aria-disabled');
    return ariaDisabled === 'true';
  }

  async isNextDisabled(): Promise<boolean> {
    const ariaDisabled = await this.nextButton.getAttribute('aria-disabled');
    return ariaDisabled === 'true';
  }

  // Assertions
  async expectPaginationVisible(): Promise<void> {
    await expect(this.pagination).toBeVisible();
  }

  async expectPaginationHidden(): Promise<void> {
    await expect(this.pagination).not.toBeVisible();
  }

  async expectPreviousEnabled(): Promise<void> {
    await expect(this.previousButton).not.toHaveAttribute('aria-disabled', 'true');
  }

  async expectPreviousDisabled(): Promise<void> {
    await expect(this.previousButton).toHaveAttribute('aria-disabled', 'true');
  }

  async expectNextEnabled(): Promise<void> {
    await expect(this.nextButton).not.toHaveAttribute('aria-disabled', 'true');
  }

  async expectNextDisabled(): Promise<void> {
    await expect(this.nextButton).toHaveAttribute('aria-disabled', 'true');
  }

  async expectPageButtonVisible(pageNumber: number): Promise<void> {
    await expect(this.getPageButton(pageNumber)).toBeVisible();
  }

  async expectCurrentPage(pageNumber: number): Promise<void> {
    const pageButton = this.getPageButton(pageNumber);
    await expect(pageButton).toHaveAttribute('aria-current', 'page');
  }
}

