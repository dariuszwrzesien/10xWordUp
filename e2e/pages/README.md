# Page Object Model (POM) - E2E Tests

This directory contains Page Object Model classes for E2E testing with Playwright.

## Structure

```
pages/
├── base.page.ts                    # Base class for all page objects
├── index.ts                        # Central export file
│
├── login.page.ts                   # Login page
├── register.page.ts                # Registration page
├── forgot-password.page.ts         # Forgot password page
├── reset-password.page.ts          # Reset password page
├── words-list.page.ts              # Words list (main dashboard)
├── quiz.page.ts                    # Quiz page
│
└── components/                     # Reusable component objects
    ├── user-menu.component.ts
    ├── word-form-dialog.component.ts
    ├── delete-word-dialog.component.ts
    ├── tag-filter.component.ts
    ├── words-pagination.component.ts
    ├── quiz-setup.component.ts
    ├── quiz-session.component.ts
    ├── question-card.component.ts
    └── quiz-summary.component.ts
```

## Usage

Import page objects from the central export file:

```typescript
import { 
  LoginPage, 
  WordsListPage, 
  WordFormDialogComponent,
  UserMenuComponent 
} from './pages';

test('Example test', async ({ page }) => {
  const username = process.env.E2E_USERNAME;
  const password = process.env.E2E_PASSWORD;

  const loginPage = new LoginPage(page);
  const wordsListPage = new WordsListPage(page);

  await loginPage.navigate();
  await loginPage.login(username, password);
  await wordsListPage.expectTableVisible();
});
```

**Note:** Always use environment variables (`E2E_USERNAME`, `E2E_PASSWORD`) instead of hardcoded credentials.

## Key Features

- **All elements use `data-testid`** for stable selectors
- **Type-safe** with TypeScript
- **Reusable components** for dialogs, menus, filters
- **Built-in assertions** with `expect` methods
- **Follows Playwright best practices**

## Documentation

See full documentation in: `/docs/68-implementacja-page-object-model.md`

## Examples

Check example tests in: `/e2e/examples/pom-usage.spec.ts`

