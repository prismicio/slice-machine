import { expect, Locator, Page } from "@playwright/test";

import { Dialog } from "./Dialog";

export class CreateSliceDialog extends Dialog {
  readonly nameInput: Locator;

  constructor(page: Page) {
    super(page, {
      title: "Create a new slice",
      submitName: "Create",
    });

    /**
     * Components
     */
    // Handle components here

    /**
     * Static locators
     */
    this.nameInput = this.dialog.getByTestId("slice-name-input");
  }

  /**
   * Dynamic locators
   */
  // Handle dynamic locators here

  /**
   * Actions
   */
  async createSlice(name: string) {
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
