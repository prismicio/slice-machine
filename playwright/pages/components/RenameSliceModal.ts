import { expect, Locator, Page } from "@playwright/test";

import { Modal } from "./Modal";

export class RenameSliceModal extends Modal {
  readonly nameInput: Locator;
  readonly renamedMessage: Locator;

  constructor(page: Page) {
    super(page, "Rename a slice", "Rename");

    /**
     * Components
     */
    // Handle components here

    /**
     * Static locators
     */
    this.nameInput = this.modal.getByTestId("slice-name-input");
    this.renamedMessage = page.getByText("Slice name updated");
  }

  /**
   * Dynamic locators
   */
  // Handle dynamic locators here

  /**
   * Actions
   */
  async renameSlice(name: string) {
    await expect(this.title).toBeVisible();
    await this.nameInput.fill(name);
    await this.submitButton.click();
    await expect(this.title).not.toBeVisible();
  }

  /**
   * Assertions
   */
  async checkRenamedMessage() {
    await expect(this.renamedMessage).toBeVisible();
    await expect(this.renamedMessage).not.toBeVisible();
  }
}
