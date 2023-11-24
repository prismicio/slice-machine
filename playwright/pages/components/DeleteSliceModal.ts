import { expect, Page } from "@playwright/test";

import { Modal } from "./Modal";

export class DeleteSliceModal extends Modal {
  constructor(page: Page) {
    super(page, "Delete Slice", "Delete");

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
  async deleteSlice() {
    await expect(this.title).toBeVisible();
    await this.submitButton.click();
    await expect(this.title).not.toBeVisible();
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
