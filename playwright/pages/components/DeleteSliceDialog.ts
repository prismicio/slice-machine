import { expect, Locator, Page } from "@playwright/test";

import { Dialog } from "./Dialog";

export class DeleteSliceDialog extends Dialog {
  readonly deletedMessage: Locator;

  constructor(page: Page) {
    super(page, {
      title: "Delete Slice",
      submitName: "Delete",
    });

    /**
     * Components
     */
    // Handle components here

    /**
     * Static locators
     */
    this.deletedMessage = page.getByText("Successfully deleted slice", {
      exact: false,
    });
  }

  /**
   * Dynamic locators
   */
  // Handle dynamic locators here

  /**
   * Actions
   */
  async deleteSlice(name: string) {
    await expect(this.title).toBeVisible();
    await expect(
      this.dialog.getByText(name, {
        exact: false,
      }),
    ).toBeVisible();
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
