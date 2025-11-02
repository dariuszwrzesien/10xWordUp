import { test, expect } from '@playwright/test';
import { 
  WordsListPage, 
  WordFormDialogComponent,
  DeleteWordDialogComponent,
  TagFilterComponent,
  WordsPaginationComponent 
} from '../pages';

/**
 * Words Management E2E Tests using Page Object Model
 * Based on scenarios from docs/64-scenariusze-testowania-e2e.md
 * 
 * Note: These tests require authenticated user state
 * Use fixtures/auth.fixture.ts for authentication
 */

test.describe('Words List - Display and Navigation', () => {

  test.skip('TC-WORDS-001: Display empty state for new user', async ({ page }) => {
    const wordsListPage = new WordsListPage(page);

    await wordsListPage.navigate();
    await wordsListPage.expectEmptyState();
  });

  test.skip('TC-WORDS-002: Display words list with pagination', async ({ page }) => {
    const wordsListPage = new WordsListPage(page);
    const pagination = new WordsPaginationComponent(page);

    await wordsListPage.navigate();
    await wordsListPage.waitForWordsToLoad();

    // Verify table and pagination
    await wordsListPage.expectTableVisible();
    await pagination.expectPaginationVisible();
    await pagination.expectCurrentPage(1);
  });

  test.skip('TC-WORDS-003: Navigate through pagination', async ({ page }) => {
    const wordsListPage = new WordsListPage(page);
    const pagination = new WordsPaginationComponent(page);

    await wordsListPage.navigate();
    await wordsListPage.waitForWordsToLoad();

    // Verify page 1
    await pagination.expectCurrentPage(1);
    await pagination.expectPreviousDisabled();

    // Go to page 2
    await pagination.clickNext();
    await expect(page).toHaveURL(/page=2/);

    // Verify page 2
    await pagination.expectCurrentPage(2);
    await pagination.expectPreviousEnabled();
  });

  test.skip('TC-WORDS-004: Filter words by tag', async ({ page }) => {
    const wordsListPage = new WordsListPage(page);
    const tagFilter = new TagFilterComponent(page);

    await wordsListPage.navigate();
    await wordsListPage.waitForWordsToLoad();

    // Apply tag filter
    await tagFilter.selectTag('business');

    // Verify filter applied
    await expect(page).toHaveURL(/tag=business/);
    await tagFilter.expectSelectedFilter('business');
    await wordsListPage.expectTableVisible();

    // Clear filter
    await tagFilter.selectAllWords();
    await expect(page).not.toHaveURL(/tag=/);
  });
});

test.describe('Words Management - Create', () => {

  test.skip('TC-WORDS-005: Add new word with basic data', async ({ page }) => {
    const wordsListPage = new WordsListPage(page);
    const wordFormDialog = new WordFormDialogComponent(page);

    await wordsListPage.navigate();
    
    // Open dialog
    await wordsListPage.clickAddWord();
    await wordFormDialog.expectDialogVisible();
    await wordFormDialog.expectDialogTitle('Dodaj słówko');

    // Fill and submit
    await wordFormDialog.fillWord('apple');
    await wordFormDialog.fillTranslation('jabłko');
    await wordFormDialog.clickSubmit();

    // Verify word added
    await wordFormDialog.expectDialogHidden();
    await wordsListPage.expectTableVisible();
  });

  test.skip('TC-WORDS-008: Add word with multiple tags', async ({ page }) => {
    const wordsListPage = new WordsListPage(page);
    const wordFormDialog = new WordFormDialogComponent(page);

    await wordsListPage.navigate();
    await wordsListPage.clickAddWord();

    // Fill form with tags
    await wordFormDialog.fillWord('business');
    await wordFormDialog.fillTranslation('biznes');
    await wordFormDialog.addTag('business');
    await wordFormDialog.addTag('formal');
    await wordFormDialog.addTag('work');

    // Verify tags added
    await wordFormDialog.expectTagSelected('business');
    await wordFormDialog.expectTagSelected('formal');
    await wordFormDialog.expectTagSelected('work');

    // Submit
    await wordFormDialog.clickSubmit();
    await wordFormDialog.expectDialogHidden();
  });

  test.skip('TC-WORDS-007: Validation - empty required fields', async ({ page }) => {
    const wordsListPage = new WordsListPage(page);
    const wordFormDialog = new WordFormDialogComponent(page);

    await wordsListPage.navigate();
    await wordsListPage.clickAddWord();

    // Try to submit with empty fields
    await wordFormDialog.clickSubmit();

    // Verify validation errors
    await wordFormDialog.expectWordError();
    await wordFormDialog.expectTranslationError();
    await wordFormDialog.expectDialogVisible(); // Dialog should stay open
  });
});

test.describe('Words Management - Edit', () => {

  test.skip('TC-WORDS-009: Edit existing word', async ({ page }) => {
    const wordsListPage = new WordsListPage(page);
    const wordFormDialog = new WordFormDialogComponent(page);

    // Assume we have a word with known ID
    const testWordId = 'test-word-id-123';

    await wordsListPage.navigate();
    await wordsListPage.waitForWordsToLoad();

    // Click edit
    await wordsListPage.clickEdit(testWordId);
    await wordFormDialog.expectDialogVisible();
    await wordFormDialog.expectDialogTitle('Edytuj słówko');

    // Modify translation
    await wordFormDialog.fillTranslation('jabłko (owoc)');
    await wordFormDialog.clickSubmit();

    // Verify update
    await wordFormDialog.expectDialogHidden();
  });
});

test.describe('Words Management - Delete', () => {

  test.skip('TC-WORDS-012: Delete word with confirmation', async ({ page }) => {
    const wordsListPage = new WordsListPage(page);
    const deleteDialog = new DeleteWordDialogComponent(page);

    const testWordId = 'test-word-id-123';

    await wordsListPage.navigate();
    await wordsListPage.waitForWordsToLoad();

    // Click delete
    await wordsListPage.clickDelete(testWordId);

    // Verify delete dialog
    await deleteDialog.expectDialogVisible();
    
    // Confirm deletion
    await deleteDialog.clickConfirm();

    // Verify word removed
    await deleteDialog.expectDialogHidden();
    await wordsListPage.expectWordRowNotVisible(testWordId);
  });

  test.skip('TC-WORDS-013: Cancel word deletion', async ({ page }) => {
    const wordsListPage = new WordsListPage(page);
    const deleteDialog = new DeleteWordDialogComponent(page);

    const testWordId = 'test-word-id-123';

    await wordsListPage.navigate();
    await wordsListPage.clickDelete(testWordId);

    // Cancel deletion
    await deleteDialog.expectDialogVisible();
    await deleteDialog.clickCancel();

    // Verify word still exists
    await deleteDialog.expectDialogHidden();
    await wordsListPage.expectWordRowVisible(testWordId);
  });
});

test.describe('Words Management - Tag Management', () => {

  test.skip('TC-WORDS-015: Create new tag when adding word', async ({ page }) => {
    const wordsListPage = new WordsListPage(page);
    const wordFormDialog = new WordFormDialogComponent(page);

    await wordsListPage.navigate();
    await wordsListPage.clickAddWord();

    // Add new tag
    const newTagName = 'medicine';
    await wordFormDialog.fillWord('aspirin');
    await wordFormDialog.fillTranslation('aspiryna');
    await wordFormDialog.addTag(newTagName);

    // Verify tag created and selected
    await wordFormDialog.expectTagSelected(newTagName);

    // Submit word
    await wordFormDialog.clickSubmit();
    await wordFormDialog.expectDialogHidden();

    // Verify tag appears in filter
    const tagFilter = new TagFilterComponent(page);
    await tagFilter.expectTagOption(newTagName);
  });
});


