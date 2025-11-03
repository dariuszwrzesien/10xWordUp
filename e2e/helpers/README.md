# E2E Test Helpers

This directory contains helper utilities for E2E testing with Playwright.

## Available Helpers

### `db-cleanup.helper.ts`

Database cleanup utilities for managing test data in Supabase.

#### Functions

##### `cleanupUserData(userId: string, config: SupabaseConfig): Promise<CleanupStats>`

Cleans up all test data for a specific user. This is the main cleanup function used by the global teardown.

**Parameters:**
- `userId` - The UUID of the test user
- `config` - Supabase configuration object with `url` and `key`

**Returns:**
- `CleanupStats` object with counts of deleted records:
  - `wordTagsDeleted: number`
  - `wordsDeleted: number`
  - `tagsDeleted: number`

**Example:**
```typescript
import { cleanupUserData } from './helpers/db-cleanup.helper';

const stats = await cleanupUserData(testUserId, {
  url: process.env.SUPABASE_URL!,
  key: process.env.SUPABASE_KEY!,
});

console.log(`Deleted ${stats.wordsDeleted} words`);
```

##### `cleanupWords(userId: string, config: SupabaseConfig): Promise<number>`

Deletes all words (and related word_tags) for a specific user.

**Parameters:**
- `userId` - The UUID of the test user
- `config` - Supabase configuration object

**Returns:**
- Number of deleted words

**Example:**
```typescript
import { cleanupWords } from './helpers/db-cleanup.helper';

const deletedCount = await cleanupWords(testUserId, {
  url: process.env.SUPABASE_URL!,
  key: process.env.SUPABASE_KEY!,
});
```

##### `cleanupTags(userId: string, config: SupabaseConfig): Promise<number>`

Deletes all tags for a specific user.

**Parameters:**
- `userId` - The UUID of the test user
- `config` - Supabase configuration object

**Returns:**
- Number of deleted tags

**Example:**
```typescript
import { cleanupTags } from './helpers/db-cleanup.helper';

const deletedCount = await cleanupTags(testUserId, {
  url: process.env.SUPABASE_URL!,
  key: process.env.SUPABASE_KEY!,
});
```

##### `verifyCleanup(userId: string, config: SupabaseConfig): Promise<boolean>`

Verifies that all test data has been cleaned up for a user.

**Parameters:**
- `userId` - The UUID of the test user
- `config` - Supabase configuration object

**Returns:**
- `true` if no test data exists, `false` otherwise

**Example:**
```typescript
import { verifyCleanup } from './helpers/db-cleanup.helper';

const isClean = await verifyCleanup(testUserId, {
  url: process.env.SUPABASE_URL!,
  key: process.env.SUPABASE_KEY!,
});

console.log(`Database is clean: ${isClean}`);
```

##### `createSupabaseClient(config: SupabaseConfig)`

Creates a typed Supabase client for database operations.

**Parameters:**
- `config` - Supabase configuration object with `url` and `key`

**Returns:**
- Typed Supabase client with Database schema

**Example:**
```typescript
import { createSupabaseClient } from './helpers/db-cleanup.helper';

const supabase = createSupabaseClient({
  url: process.env.SUPABASE_URL!,
  key: process.env.SUPABASE_KEY!,
});

// Use the client for custom operations
const { data } = await supabase.from('words').select('*');
```

## Usage in Tests

### Using in test fixtures

You can create a custom fixture that cleans up data after each test:

```typescript
// e2e/fixtures/cleanup.fixture.ts
import { test as base } from '@playwright/test';
import { cleanupUserData } from '../helpers/db-cleanup.helper';

export const test = base.extend({
  cleanDatabase: async ({}, use) => {
    // Setup (if needed)
    await use();
    
    // Teardown - cleanup after test
    const testUserId = process.env.E2E_USERNAME_ID!;
    await cleanupUserData(testUserId, {
      url: process.env.SUPABASE_URL!,
      key: process.env.SUPABASE_KEY!,
    });
  },
});
```

### Using in test hooks

```typescript
import { test, expect } from '@playwright/test';
import { cleanupWords } from './helpers/db-cleanup.helper';

test.describe('Words management', () => {
  test.afterEach(async () => {
    // Clean up words after each test
    const testUserId = process.env.E2E_USERNAME_ID!;
    await cleanupWords(testUserId, {
      url: process.env.SUPABASE_URL!,
      key: process.env.SUPABASE_KEY!,
    });
  });

  test('should add a new word', async ({ page }) => {
    // Test implementation
  });
});
```

### Verifying cleanup in tests

```typescript
import { test, expect } from '@playwright/test';
import { verifyCleanup } from './helpers/db-cleanup.helper';

test.describe('Cleanup verification', () => {
  test('should verify database is clean after teardown', async () => {
    const testUserId = process.env.E2E_USERNAME_ID!;
    const isClean = await verifyCleanup(testUserId, {
      url: process.env.SUPABASE_URL!,
      key: process.env.SUPABASE_KEY!,
    });

    expect(isClean).toBe(true);
  });
});
```

## Best Practices

1. **Always use environment variables** for Supabase credentials
2. **Use specific cleanup functions** when you only need to clean certain tables
3. **Verify cleanup** in critical test scenarios
4. **Handle errors gracefully** - cleanup failures shouldn't block tests
5. **Use typed clients** for better IDE support and type safety

## Related Files

- `../global-teardown.ts` - Global teardown that runs after all tests
- `../../playwright.config.ts` - Playwright configuration with globalTeardown setup
- `../../docs/75-implementacja-mechanizmu-teardown.md` - Detailed documentation

