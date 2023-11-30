import { expect, Locator, Page } from "@playwright/test";

import { Dialog } from "./Dialog";

export class CreateSliceDialog extends Dialog {
  readonly createdMessage: Locator;
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
    this.createdMessage = page.getByText("Slice saved successfully");
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
    await this.checkCreatedMessage();
    await expect(this.title).not.toBeVisible();
  }

  /**
   * Assertions
   */
  async checkCreatedMessage() {
    await expect(this.createdMessage).toBeVisible();
    await expect(this.createdMessage).not.toBeVisible();
  }
}
