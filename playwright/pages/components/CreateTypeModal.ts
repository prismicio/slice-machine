import { expect, Locator, Page } from "@playwright/test";

import { Modal } from "./Modal";

export class CreateTypeModal extends Modal {
  readonly nameInput: Locator;

  constructor(page: Page, format: "page" | "custom") {
    super(page, `Create a new ${format} type`, "Create");

    /**
     * Static locators
     */
    this.nameInput = this.modal.getByTestId("ct-name-input");
  }

  /**
   * Dynamic locators
   */
  // Handle dynamic locators here

  /**
   * Actions
   */
  async createType(name: string) {
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
