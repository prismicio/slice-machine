import { Locator, Page, expect } from "@playwright/test";

import { LoginModal } from "./components/LoginModal";
import { Menu } from "./components/Menu";

export class ChangesPage {
  readonly page: Page;
  readonly menu: Menu;
  readonly loginModal: LoginModal;

  readonly title: Locator;

  constructor(page: Page) {
    /**
     * Components
     */
    this.page = page;
    this.menu = new Menu(page);
    this.loginModal = new LoginModal(page);

    /**
     * Static locators
     */
    this.title = page.getByLabel("Breadcrumb").getByText("Changes");
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
    await expect(this.title).toBeVisible();
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
