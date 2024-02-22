import { type Page, expect } from "@playwright/test";

import { Dialog } from "./Dialog";

export class GitRepositoryDisconnectDialog extends Dialog {
  constructor(page: Page) {
    super(page, { title: "Remove Git Connection", submitName: "Disconnect" });

    /**
     * Components
     */

    /**
     * Static locators
     */
  }

  /**
   * Dynamic locators
   */

  /**
   * Actions
   */
  async disconnect() {
    await expect(this.title).toBeVisible();
    await this.submitButton.click();
    await expect(this.title).not.toBeVisible();
  }

  /**
   * Assertions
   */
}
