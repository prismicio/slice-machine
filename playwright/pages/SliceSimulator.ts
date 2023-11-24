import { Page } from "@playwright/test";

import { Menu } from "./components/Menu";

export class SliceSimulatorPage {
  readonly page: Page;
  readonly menu: Menu;

  constructor(page: Page) {
    /**
     * Components
     */
    this.page = page;
    this.menu = new Menu(page);

    /**
     * Static locators
     */
    // Handle static locators here
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
