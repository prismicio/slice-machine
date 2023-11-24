import { Locator, Page } from "@playwright/test";

import { Menu } from "./components/Menu";

export class ChangelogPage {
  readonly page: Page;
  readonly menu: Menu;

  readonly title: Locator;

  constructor(page: Page) {
    /**
     * Components
     */
    this.page = page;
    this.menu = new Menu(page);

    /**
     * Static locators
     */
    this.title = page.getByRole("main").getByText("Changelog");
  }

  /**
   * Dynamic locators
   */
  // Handle dynamic locators here

  /**
   * Actions
   */
  // Handle actions here

  /**
   * Assertions
   */
  // Handle assertions here
}
