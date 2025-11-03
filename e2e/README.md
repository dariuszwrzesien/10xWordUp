# Page Object Model (POM) - Quick Start Guide

## 📚 What's Implemented

Complete Page Object Model architecture for E2E testing with Playwright:

- ✅ **15 POM classes** (6 pages + 9 components)
- ✅ **~130 data-testid selectors** integrated
- ✅ **49 test scenarios** covered
- ✅ **Full TypeScript** support
- ✅ **Comprehensive documentation**

## 🚀 Quick Start

### 0. Setup Environment Variables

Create a `.env.test` file with your test user credentials:

```bash
E2E_USERNAME=your-test-email@example.com
E2E_PASSWORD=your-test-password
E2E_USERNAME_ID=optional-user-uuid
```

**Important:** These credentials should match a real user in your test database.

### 1. Import POM Classes

```typescript
import { 
  LoginPage, 
  WordsListPage, 
  WordFormDialogComponent,
  UserMenuComponent 
} from './pages';
```

### 2. Use in Tests

```typescript
test('User can login and add word', async ({ page }) => {
  const username = process.env.E2E_USERNAME;
  const password = process.env.E2E_PASSWORD;

  // Login
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login(username, password);

  // Add word
  const wordsListPage = new WordsListPage(page);
  const wordDialog = new WordFormDialogComponent(page);
  
  await wordsListPage.clickAddWord();
  await wordDialog.createWord('apple', 'jabłko', ['food']);
  await wordDialog.expectDialogHidden();
});
```

### 3. Use Authentication Fixture (Recommended)

For tests that require authenticated user, use the auth fixture:

```typescript
import { test, expect } from './fixtures/auth.fixture';

test('Authenticated test', async ({ page, authenticatedUser }) => {
  // User is already logged in!
  await page.goto('/');
  
  // Access user info
  console.log(authenticatedUser.email);
  console.log(authenticatedUser.id);
});
```

## 🧹 Database Cleanup

### Automatic Cleanup After Tests

The test suite includes automatic database cleanup that runs **once after all tests complete**. This ensures your test database stays clean between test runs.

**What gets cleaned up:**
- ✅ All words created by the test user
- ✅ All tags created by the test user
- ✅ All word-tag associations

**Configuration:**
Set `E2E_USERNAME_ID` in `.env.test` to enable automatic cleanup:
```bash
E2E_USERNAME_ID=your-test-user-uuid
```

**Console output after tests:**
```
🧹 Starting database cleanup...
✅ Deleted 42 word_tags entries
✅ Deleted 15 words
✅ Deleted 5 tags
✨ Database cleanup completed successfully!
```

### Manual Cleanup Helpers

For more granular control, use cleanup helpers in your tests:

```typescript
import { cleanupWords, cleanupTags, cleanupUserData } from './helpers/db-cleanup.helper';

test.afterEach(async () => {
  // Clean up only words after each test
  await cleanupWords(process.env.E2E_USERNAME_ID!, {
    url: process.env.SUPABASE_URL!,
    key: process.env.SUPABASE_KEY!,
  });
});
```

**See:** [`helpers/README.md`](helpers/README.md) for full documentation of cleanup helpers.

## 📁 Available POM Classes

### Authentication
- `LoginPage` - Login form
- `RegisterPage` - Registration form
- `ForgotPasswordPage` - Password reset request
- `ResetPasswordPage` - Password reset with token
- `UserMenuComponent` - User menu & logout

### Words Management
- `WordsListPage` - Main dashboard
- `WordFormDialogComponent` - Add/Edit word
- `DeleteWordDialogComponent` - Delete confirmation
- `TagFilterComponent` - Tag filtering
- `WordsPaginationComponent` - Pagination

### Quiz
- `QuizPage` - Quiz wrapper
- `QuizSetupComponent` - Configuration
- `QuizSessionComponent` - Active session
- `QuestionCardComponent` - Question card
- `QuizSummaryComponent` - Results

## 📖 Documentation

- **Full Documentation:** [`docs/68-implementacja-page-object-model.md`](../docs/68-implementacja-page-object-model.md)
- **Implementation Summary:** [`docs/69-podsumowanie-implementacji-pom.md`](../docs/69-podsumowanie-implementacji-pom.md)
- **Database Teardown Summary:** [`docs/76-podsumowanie-implementacji-teardown.md`](../docs/76-podsumowanie-implementacji-teardown.md)
- **Test Isolation Best Practices:** [`docs/77-izolacja-testow-e2e-best-practices.md`](../docs/77-izolacja-testow-e2e-best-practices.md) ⭐ **NEW**
- **POM Classes Details:** [`pages/README.md`](pages/README.md)
- **Cleanup Helpers:** [`helpers/README.md`](helpers/README.md)

## 📝 Example Test Files

Check these files for complete examples:

- [`examples/pom-usage.spec.ts`](examples/pom-usage.spec.ts) - General examples
- [`auth/login-pom.spec.ts`](auth/login-pom.spec.ts) - Authentication tests
- [`words/words-pom.spec.ts`](words/words-pom.spec.ts) - Words management tests
- [`quiz/quiz-pom.spec.ts`](quiz/quiz-pom.spec.ts) - Quiz tests

## 🎯 Common Patterns

### Pattern 1: Simple Page Navigation

```typescript
const loginPage = new LoginPage(page);
await loginPage.navigate();
await loginPage.expectFormVisible();
```

### Pattern 2: Form Submission

```typescript
const loginPage = new LoginPage(page);
await loginPage.login('email@test.com', 'password');
```

### Pattern 3: Component Interaction

```typescript
const wordDialog = new WordFormDialogComponent(page);
await wordDialog.fillWord('apple');
await wordDialog.fillTranslation('jabłko');
await wordDialog.addTag('food');
await wordDialog.clickSubmit();
```

### Pattern 4: Assertions

```typescript
await wordsListPage.expectTableVisible();
await userMenu.expectUserEmail('test@example.com');
await pagination.expectCurrentPage(1);
```

### Pattern 5: Combining Multiple Components

```typescript
const wordsListPage = new WordsListPage(page);
const tagFilter = new TagFilterComponent(page);
const pagination = new WordsPaginationComponent(page);

await wordsListPage.navigate();
await tagFilter.selectTag('business');
await pagination.clickNext();
```

## 🔧 Running Tests

### Prerequisites

1. **Environment Setup**: Create `.env.test` with credentials:
```bash
E2E_USERNAME=your-test-user@example.com
E2E_PASSWORD=your-secure-password
E2E_USERNAME_ID=your-user-uuid  # Required for test isolation!
```

2. **Start Test Server**:
```bash
npm run dev:e2e
```

### Running Tests

```bash
# Run all E2E tests (parallel by default)
npm run test:e2e

# Run tests sequentially (for debugging isolation issues)
npm run test:e2e -- --workers=1

# Run specific test file
npx playwright test e2e/auth/login-pom.spec.ts

# Run in UI mode (recommended for development)
npx playwright test --ui

# Run with specific browser
npx playwright test --project=chromium

# Debug mode
npx playwright test --debug
```

### ⚠️ Test Isolation

**Tests are configured to run in parallel** (`fullyParallel: true`). This is fast but requires proper test isolation:

✅ **What's implemented:**
- Each test gets isolated browser context (no shared cookies/localStorage)
- Database cleanup before/after tests
- No race conditions in authentication
- Tests can run safely in parallel

❌ **Common issues:**
- "Element not found" errors when tests run in parallel → Fixed with proper cleanup
- Login timeouts → Fixed with isolated browser contexts
- Data conflicts → Fixed with beforeEach/afterEach cleanup

📖 **Read more:** [`docs/77-izolacja-testow-e2e-best-practices.md`](../docs/77-izolacja-testow-e2e-best-practices.md)

## 🔐 Environment Variables

Tests use environment variables from `.env.test` for test credentials:

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | ✅ Yes | Supabase project URL |
| `SUPABASE_KEY` | ✅ Yes | Supabase anon/service key |
| `SUPABASE_ACCESS_TOKEN` | ⚪ No | Supabase access token (optional) |
| `E2E_USERNAME` | ✅ Yes | Email of test user |
| `E2E_PASSWORD` | ✅ Yes | Password of test user |
| `E2E_USERNAME_ID` | ✅ Yes | UUID of test user (required for database cleanup) |

**Example `.env.test`:**
```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-or-service-key
SUPABASE_ACCESS_TOKEN=optional-access-token

# Test User Credentials
E2E_USERNAME=test.user@10xwordup.com
E2E_PASSWORD=SecurePassword123!
E2E_USERNAME_ID=123e4567-e89b-12d3-a456-426614174000
```

**Important:** `E2E_USERNAME_ID` is now required for automatic database cleanup after tests.

**Usage in tests:**
```typescript
test('my test', async ({ page }) => {
  const username = process.env.E2E_USERNAME;
  const password = process.env.E2E_PASSWORD;
  
  if (!username || !password) {
    throw new Error("E2E credentials not set");
  }
  
  await loginPage.login(username, password);
});
```

**Using Auth Fixture (Recommended):**
```typescript
import { test } from './fixtures/auth.fixture';

test('authenticated test', async ({ page, authenticatedUser }) => {
  // User is already logged in!
  console.log(authenticatedUser.email); // from E2E_USERNAME
  console.log(authenticatedUser.id);     // from E2E_USERNAME_ID
});
```

## 📋 Test Scenarios Coverage

### Authentication (TC-AUTH-*)
- ✅ Login flow
- ✅ Registration
- ✅ Password reset
- ✅ Logout
- ✅ Route protection

### Words Management (TC-WORDS-*)
- ✅ List display
- ✅ CRUD operations
- ✅ Tag management
- ✅ Filtering
- ✅ Pagination

### Quiz (TC-QUIZ-*)
- ✅ Configuration
- ✅ Session flow
- ✅ Question answering
- ✅ Summary

## 💡 Tips

1. **Use data-testid**: All POM classes use stable `data-testid` selectors
2. **Type safety**: Leverage TypeScript autocompletion
3. **Reusable components**: Components can be used across different tests
4. **Clear naming**: Method names are self-descriptive
5. **Built-in waits**: Playwright automatically waits for elements

## 🐛 Debugging

### Check element visibility
```typescript
await page.pause(); // Opens Playwright Inspector
await wordsListPage.expectTableVisible();
```

### Screenshot on failure
```typescript
test('my test', async ({ page }) => {
  // Test code
  await page.screenshot({ path: 'screenshot.png' });
});
```

### Use trace viewer
```bash
npx playwright test --trace on
npx playwright show-trace trace.zip
```

## 🆘 Need Help?

- Check examples in `examples/pom-usage.spec.ts`
- Read full documentation in `docs/68-implementacja-page-object-model.md`
- Look at test scenarios in `docs/64-scenariusze-testowania-e2e.md`
- Review data-testid mapping in `docs/66-implementacja-data-testid-dla-testow-e2e.md`

---

**Happy Testing! 🎉**
