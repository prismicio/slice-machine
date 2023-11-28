import { expect, Locator, Page } from "@playwright/test";

import { Modal } from "./Modal";

export class CreateSliceModal extends Modal {
  readonly nameInput: Locator;

  constructor(page: Page) {
    super(page, "Create a new slice", "Create");

    /**
     * Components
     */
    // Handle components here

    /**
     * Static locators
     */
    this.nameInput = this.modal.getByTestId("slice-name-input");
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
