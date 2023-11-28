import { Locator, Page, expect } from "@playwright/test";

import { LoginModal } from "./components/LoginModal";
import { BasePage } from "./components/BasePage";

export class ChangesPage extends BasePage {
  readonly loginModal: LoginModal;

  readonly breadcrumbLabel: Locator;

  constructor(page: Page) {
    super(page);

    /**
     * Components
     */
    this.loginModal = new LoginModal(page);

    /**
     * Static locators
     */
    this.breadcrumbLabel = this.breadcrumb.getByText("Changes");
  }

  /**
   * Dynamic locators
   */
  // Handle dynamic locators here

  /**
   * Actions
   */
  async goto() {
    await this.page.goto("/changes");
    await expect(this.breadcrumb).toBeVisible();
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
