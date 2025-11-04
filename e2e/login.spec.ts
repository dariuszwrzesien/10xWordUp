import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages";

test.describe("Login Page", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  test("should display login form", async () => {
    await loginPage.expectFormVisible();
  });

  test("should show validation error for empty fields", async () => {
    await loginPage.clickSubmit();
    // Add your specific validation error checks here
    // Example: await expect(page.getByText(/email is required/i)).toBeVisible();
  });

  test("should login successfully with valid credentials", async ({ page }) => {
    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    if (!username || !password) {
      throw new Error(
        "E2E_USERNAME and E2E_PASSWORD must be set in environment variables (.env.test locally or GitHub secrets in CI)"
      );
    }

    await loginPage.login(username, password);

    // Wait for redirect and session establishment
    await page.waitForURL("/", {
      timeout: 15000,
      waitUntil: "load",
    });
    await page.waitForLoadState("networkidle", { timeout: 5000 });

    // Verify we're on the home page
    await expect(page).toHaveURL("/");
  });
});
