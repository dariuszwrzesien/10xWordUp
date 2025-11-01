import { test as base, expect } from '@playwright/test';

/**
 * Fixture for authenticated user
 * This allows you to reuse authentication state across tests
 */
export const test = base.extend({
  // You can add custom fixtures here
  // For example, a fixture that logs in before each test
});

export { expect };


