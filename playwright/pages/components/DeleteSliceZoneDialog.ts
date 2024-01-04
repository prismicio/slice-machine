import { Page, expect } from "@playwright/test";

import { Dialog } from "./Dialog";

export class DeleteSliceZoneDialog extends Dialog {
  constructor(page: Page) {
    super(page, {
      title: "Do you really want to delete Slice Zone?",
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
  async deleteSliceZone() {
    await expect(this.title).toBeVisible();
    await this.submitButton.click();
    await expect(this.dialog).not.toBeVisible();
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
