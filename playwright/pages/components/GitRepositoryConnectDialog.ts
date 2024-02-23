import { type Locator, type Page, expect } from "@playwright/test";

import { Dialog } from "./Dialog";

export class GitRepositoryConnectDialog extends Dialog {
  readonly writeAPITokenInput: Locator;

  constructor(page: Page) {
    super(page, {
      title: "Prismic Write API token required",
      submitName: "Save Token",
    });

    /**
     * Components
     */
    // Handle components here

    /**
     * Static locators
     */
    // Handle static locators here
    this.writeAPITokenInput = page.getByPlaceholder("Write API token", {
      exact: true,
    });
  }

  /**
   * Dynamic locators
   */
  // Handle dynamic locators here

  /**
   * Actions
   */
  // Handle actions here
  async connect(writeAPIToken: string) {
    await expect(this.title).toBeVisible();
    await this.writeAPITokenInput.fill(writeAPIToken);
    await this.submitButton.click();
    await expect(this.title).not.toBeVisible();
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
