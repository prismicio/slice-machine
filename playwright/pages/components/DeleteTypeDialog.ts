import { expect, Page } from "@playwright/test";

import { Dialog } from "./Dialog";

export class DeleteTypeDialog extends Dialog {
  constructor(page: Page, format: "page" | "custom") {
    super(page, {
      title: `Delete ${format} type`,
      submitName: "Delete",
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
  async deleteType() {
    await expect(this.title).toBeVisible();
    await this.submitButton.click();
    await expect(this.title).not.toBeVisible();
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
