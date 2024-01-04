import { expect, Page } from "@playwright/test";

import { Dialog } from "./Dialog";

export class DeleteTabDialog extends Dialog {
  constructor(page: Page) {
    super(page, {
      title: "Remove Tab",
      submitName: "Yes, remove tab",
    });

    /**
     * Components
     */
    // Handle components here

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
  async deleteTab() {
    await expect(this.title).toBeVisible();
    await this.submitButton.click();
    await expect(this.title).not.toBeVisible();
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
