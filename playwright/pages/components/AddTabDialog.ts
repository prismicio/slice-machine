import { expect, Locator, Page } from "@playwright/test";

import { Dialog } from "./Dialog";

export class AddTabDialog extends Dialog {
  readonly idInput: Locator;

  constructor(page: Page) {
    super(page, {
      title: "Add Tab",
      submitName: "Save",
    });

    /**
     * Components
     */
    // Handle components here

    /**
     * Static locators
     */
    this.idInput = this.dialog.getByPlaceholder(
      "A label for selecting the tab (i.e. not used in the API)",
      { exact: true },
    );
  }

  /**
   * Dynamic locators
   */
  // Handle dynamic locators here

  /**
   * Actions
   */
  async createTab(name: string) {
    await expect(this.title).toBeVisible();
    await this.idInput.fill(name);
    await this.submitButton.click();
    await expect(this.title).not.toBeVisible();
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
