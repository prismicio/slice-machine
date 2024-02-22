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

    /**
     * Static locators
     */
    this.writeAPITokenInput = page.getByPlaceholder("Write API token", {
      exact: true,
    });
  }

  /**
   * Dynamic locators
   */

  /**
   * Actions
   */
  async connect(writeAPIToken: string) {
    await expect(this.title).toBeVisible();
    await this.writeAPITokenInput.fill(writeAPIToken);
    await this.submitButton.click();
    await expect(this.title).not.toBeVisible();
  }

  /**
   * Assertions
   */
}
