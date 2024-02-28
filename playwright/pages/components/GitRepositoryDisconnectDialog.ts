import { type Page, expect } from "@playwright/test";

import { Dialog } from "./Dialog";

export class GitRepositoryDisconnectDialog extends Dialog {
  constructor(page: Page) {
    super(page, { title: "Remove Git Connection", submitName: "Disconnect" });

    /**
     * Components
     */
    // Handle components here

    /**
     * Static locators
     */
    // Handle static locators here
  }

  /**
   * Dynamic locators
   */
  // Handle dynamic locators here

  /**
   * Actions
   */
  // Handle actions here
  async disconnect() {
    await expect(this.title).toBeVisible();
    await this.submitButton.click();
    await expect(this.title).not.toBeVisible();
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
