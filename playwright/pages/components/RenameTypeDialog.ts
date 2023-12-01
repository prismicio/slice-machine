import { expect, Locator, Page } from "@playwright/test";

import { Dialog } from "./Dialog";

export class RenameTypeDialog extends Dialog {
  readonly nameInput: Locator;
  readonly renamedMessage: Locator;

  constructor(page: Page, format: "page" | "custom") {
    super(page, {
      title: `Rename a ${format} type`,
      submitName: "Rename",
    });

    /**
     * Components
     */
    // Handle components here

    /**
     * Static locators
     */
    this.nameInput = this.dialog.getByTestId("custom-type-name-input");
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
    await this.checkRenamedMessage();
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
