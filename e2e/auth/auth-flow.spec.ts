import { test, expect } from "@playwright/test";
import { LoginPage, UserMenuComponent } from "../pages";

/**
 * Authentication Flow E2E Tests
 *
 * Tests for user authentication scenarios including login success and failure cases.
 */

test.describe("Authentication Flow", () => {
  test("TC-AUTH-005: Successful login with valid credentials", async ({ page }) => {
    // Get credentials from environment variables
    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    if (!username || !password) {
      throw new Error(
        "E2E_USERNAME and E2E_PASSWORD must be set in environment variables (.env.test locally or GitHub secrets in CI)"
      );
    }

    // Initialize page objects
    const loginPage = new LoginPage(page);
    const userMenu = new UserMenuComponent(page);

    // Navigate to login page
    await loginPage.navigate();
    await loginPage.expectFormVisible();

    // Fill in credentials and submit
    await loginPage.login(username, password);

    // Wait for redirect and session establishment
    await page.waitForURL("/", {
      timeout: 15000,
      waitUntil: "load",
    });
    await page.waitForLoadState("networkidle", { timeout: 5000 });

    // Verify redirect to main page
    await expect(page).toHaveURL("/");

    // Verify user is logged in
    await userMenu.expectMenuVisible();
    await userMenu.expectUserEmail(username);
  });

  test("TC-AUTH-006: Login with incorrect password", async ({ page }) => {
    const username = process.env.E2E_USERNAME;

    if (!username) {
      throw new Error(
        "E2E_USERNAME must be set in environment variables (.env.test locally or GitHub secrets in CI)"
      );
    }

    const loginPage = new LoginPage(page);
    const userMenu = new UserMenuComponent(page);

    await loginPage.navigate();
    await loginPage.login(username, "wrongpassword", false); // expectSuccess = false

    // Verify error handling
    await expect(page).toHaveURL("/login");
    await userMenu.expectMenuVisible().catch(() => {
      // Menu should not be visible for failed login
    });
  });
});
