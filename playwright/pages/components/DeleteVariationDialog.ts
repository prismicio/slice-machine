import { type Locator, type Page, expect } from "@playwright/test";

import { Dialog } from "./Dialog";

export class DeleteVariationDialog extends Dialog {
  readonly deletedMessage: Locator;

  constructor(page: Page) {
    super(page, { title: "Delete variation", submitName: "Delete" });

    /**
     * Components
     */
    // Handle components here

    /**
     * Static locators
     */
    this.deletedMessage = page.getByText("Slice saved successfully");
  }

  /**
   * Dynamic locators
   */
  // Handle dynamic locators here

  /**
   * Actions
   */
  async deleteVariation() {
    await expect(this.title).toBeVisible();
    await this.submitButton.click();
    await this.checkDeletedMessage();
    await expect(this.title).not.toBeVisible();
  }

  /**
   * Assertions
   */
  async checkDeletedMessage() {
    await expect(this.deletedMessage).toBeVisible();
    await expect(this.deletedMessage).not.toBeVisible();
  }
}
