import { expect, Locator, Page } from "@playwright/test";

import { Dialog } from "./Dialog";

export class RenameTabDialog extends Dialog {
  readonly tabIdInput: Locator;

  constructor(page: Page) {
    super(page, {
      title: "Rename Tab",
      submitName: "Save",
    });

    /**
     * Components
     */
    // Handle components here

    /**
     * Static locators
     */
    this.tabIdInput = this.dialog.getByPlaceholder(
      "A label for selecting the tab (i.e. not used in the API)",
    );
  }

  /**
   * Dynamic locators
   */
  // Handle dynamic locators here

  /**
   * Actions
   */
  async renameTab(oldId: string, newId: string) {
    await expect(this.title).toBeVisible();
    await expect(this.tabIdInput).toHaveValue(oldId);
    await this.tabIdInput.fill(newId);
    await this.submitButton.click();
    await expect(this.title).not.toBeVisible();
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
