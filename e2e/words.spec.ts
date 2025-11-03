import { test, expect, Page } from "@playwright/test";

/**
 * Page Object Model for the Words List Page
 */
class WordsListPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto("/words");
  }

  async getWordItems() {
    return this.page.getByRole("listitem");
  }

  async searchWord(term: string) {
    const searchInput = this.page.getByPlaceholder(/search/i);
    await searchInput.fill(term);
  }

  async clickAddWord() {
    await this.page.getByRole("button", { name: /add word/i }).click();
  }
}

test.describe("Words List Page", () => {
  let wordsPage: WordsListPage;

  test.beforeEach(async ({ page }) => {
    wordsPage = new WordsListPage(page);
    // Note: This test assumes user is already logged in
    // You might want to use a setup with authentication state
  });

  test.skip("should display words list", async ({ page }) => {
    await wordsPage.goto();

    // Check if the page loaded
    await expect(page).toHaveURL(/\/words/);
  });

  test.skip("should filter words by search term", async () => {
    await wordsPage.goto();

    await wordsPage.searchWord("test");

    // Add assertions for filtered results
  });
});
