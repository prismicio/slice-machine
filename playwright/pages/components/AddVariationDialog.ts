import { type Locator, type Page, expect } from "@playwright/test";

import { Dialog } from "./Dialog";

export class AddVariationDialog extends Dialog {
  readonly nameInput: Locator;

  constructor(page: Page) {
    super(page, { title: "Add new Variation" });

    /**
     * Components
     */
    // Handle components here

    /**
     * Static locators
     */
    this.nameInput = this.dialog.getByLabel("Variation name*");
  }

  /**
   * Dynamic locators
   */
  // Handle dynamic locators here

  /**
   * Actions
   */
  async addVariation(name: string) {
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
