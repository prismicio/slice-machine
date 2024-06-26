import { type Page, expect } from "@playwright/test";

import { Dialog } from "./Dialog";

export class DeleteRepeatableZoneDialog extends Dialog {
  constructor(page: Page) {
    super(page, { title: "Delete field", submitName: "Delete" });

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
  async deleteRepeatableZone() {
    await expect(this.title).toBeVisible();
    await this.submitButton.click();
    await expect(this.title).not.toBeVisible();
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
