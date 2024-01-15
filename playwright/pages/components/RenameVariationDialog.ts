import { type Locator, type Page, expect } from "@playwright/test";

import { Dialog } from "./Dialog";

export class RenameVariationDialog extends Dialog {
  readonly nameInput: Locator;

  constructor(page: Page) {
    super(page, { title: "Rename variation", submitName: "Rename" });

    /**
     * Components
     */
    // Handle components here

    /**
     * Static locators
     */
    this.nameInput = this.dialog.getByPlaceholder("Variation name");
  }

  /**
   * Dynamic locators
   */
  // Handle dynamic locators here

  /**
   * Actions
   */
  async renameVariation(name: string) {
    await expect(this.title).toBeVisible();
    await this.nameInput.fill(name);
    await this.submitButton.click();
    await expect(this.title).not.toBeVisible();
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
