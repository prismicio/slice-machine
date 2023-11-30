import { expect, Locator, Page } from "@playwright/test";

import { Dialog } from "./Dialog";

export class CreateTypeDialog extends Dialog {
  readonly createdMessage: Locator;
  readonly nameInput: Locator;

  constructor(page: Page, format: "page" | "custom") {
    super(page, {
      title: `Create a new ${format} type`,
      submitName: "Create",
    });

    /**
     * Static locators
     */
    this.createdMessage = page.getByText(
      `${format.charAt(0).toUpperCase()}${format.slice(
        1,
      )} type saved successfully`,
    );
    this.nameInput = this.dialog.getByTestId("ct-name-input");
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
