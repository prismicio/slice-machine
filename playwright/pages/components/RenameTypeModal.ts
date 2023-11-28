import { expect, Locator, Page } from "@playwright/test";

import { Modal } from "./Modal";

export class RenameTypeModal extends Modal {
  readonly nameInput: Locator;
  readonly renamedMessage: Locator;

  constructor(page: Page, format: "page" | "custom") {
    super(page, `Rename a ${format} type`, "Rename");

    /**
     * Components
     */
    // Handle components here

    /**
     * Static locators
     */
    this.nameInput = this.modal.getByTestId("custom-type-name-input");
    this.renamedMessage = page.getByText(
      `${format.charAt(0).toUpperCase()}${format.slice(1)} type renamed`,
    );
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
  async checkRenamedMessage() {
    await expect(this.renamedMessage).toBeVisible();
    await expect(this.renamedMessage).not.toBeVisible();
  }
}
