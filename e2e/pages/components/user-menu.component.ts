import { expect } from "@playwright/test";
import { BasePage } from "../base.page";

/**
 * Component Object Model for User Menu
 * Handles user menu interactions (logout, profile)
 */
export class UserMenuComponent extends BasePage {
  // Locators
  get menuTrigger() {
    return this.getByTestId("user-menu-trigger");
  }

  get userEmail() {
    return this.getByTestId("user-email");
  }

  get menuContent() {
    return this.getByTestId("user-menu-content");
  }

  get logoutButton() {
    return this.getByTestId("logout-button");
  }

  // Actions
  async openMenu(): Promise<void> {
    // Check if menu is already open
    const isOpen = await this.menuContent.isVisible().catch(() => false);
    if (isOpen) {
      return;
    }

    // Try clicking with force first
    await this.menuTrigger.click({ force: true });

    // Wait for the menu content to appear with a reasonable timeout
    try {
      await this.menuContent.waitFor({ state: "visible", timeout: 5000 });
    } catch {
      // If first click didn't work, try regular click
      await this.menuTrigger.click();
      await this.menuContent.waitFor({ state: "visible", timeout: 5000 });
    }
  }

  async closeMenu(): Promise<void> {
    // Click outside the menu to close it
    await this.page.keyboard.press("Escape");
  }

  async logout(): Promise<void> {
    await this.openMenu();

    // Wait for the logout button to be visible and clickable
    await this.logoutButton.waitFor({ state: "visible", timeout: 5000 });

    // Use force click to avoid any pointer interception issues
    await this.logoutButton.click({ force: true });
  }

  async getUserEmail(): Promise<string> {
    return (await this.userEmail.textContent()) || "";
  }

  // Assertions
  async expectMenuVisible(): Promise<void> {
    await expect(this.menuTrigger).toBeVisible();
  }

  async expectUserEmail(email: string): Promise<void> {
    await expect(this.userEmail).toContainText(email);
  }

  async expectMenuOpened(): Promise<void> {
    await expect(this.menuContent).toBeVisible();
    await expect(this.logoutButton).toBeVisible();
  }

  async expectMenuClosed(): Promise<void> {
    await expect(this.menuContent).not.toBeVisible();
  }
}
