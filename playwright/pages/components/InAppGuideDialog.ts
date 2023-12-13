import { Locator, Page } from "@playwright/test";

import { Dialog } from "./Dialog";

export class InAppGuideDialog extends Dialog {
  override readonly closeButton: Locator;

  constructor(page: Page) {
    super(page, {
      title: "Build a page in 5 minutes",
    });

    /**
     * Components
     */
    // Handle components here

    /**
     * Static locators
     */
    this.closeButton = this.dialog.getByRole("button");
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
