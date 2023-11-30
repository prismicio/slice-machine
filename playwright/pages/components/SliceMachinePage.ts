import { Locator, Page } from "@playwright/test";

import { Menu } from "./Menu";

export class SliceMachinePage {
  readonly page: Page;
  readonly menu: Menu;
  readonly body: Locator;
  readonly breadcrumb: Locator;

  constructor(page: Page) {
    /**
     * Components
     */
    this.page = page;
    this.menu = new Menu(page);

    /**
     * Static locators
     */
    this.body = page.getByRole("main");
    this.breadcrumb = page.getByLabel("Breadcrumb");
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
