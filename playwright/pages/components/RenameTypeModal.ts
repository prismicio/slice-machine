import { expect, Locator, Page } from "@playwright/test";

import { Modal } from "./Modal";

export class RenameTypeModal extends Modal {
  readonly nameInput: Locator;

  constructor(page: Page, format: "page" | "custom") {
    super(page, `Rename a ${format} type`, "Rename");

    /**
     * Components
     */
    // Handle components here

    /**
     * Static locators
     */
    this.nameInput = this.root.getByTestId("custom-type-name-input");
  }

  /**
   * Dynamic locators
   */
  // Handle dynamic locators here

  /**
   * Actions
   */
  async renameType(newName: string) {
    await expect(this.title).toBeVisible();
    await this.nameInput.fill(newName);
    await this.submitButton.click();
    await expect(this.title).not.toBeVisible();
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
