import { Locator, Page } from "@playwright/test";

import { BasePage } from "./components/BasePage";

export class ChangelogPage extends BasePage {
  readonly breadcrumbLabel: Locator;

  constructor(page: Page) {
    super(page);

    /**
     * Components
     */
    // Handle components here

    /**
     * Static locators
     */
    this.breadcrumbLabel = this.body.getByText("Changelog");
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
