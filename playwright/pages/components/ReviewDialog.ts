import { Locator, Page, expect } from "@playwright/test";

import { Dialog } from "./Dialog";

export class ReviewDialog extends Dialog {
  readonly messageTextarea: Locator;

  constructor(page: Page) {
    super(page, {
      title: "Share feedback",
    });

    /**
     * Components
     */
    // Handle components here

    /**
     * Static locators
     */
    this.messageTextarea = this.dialog.getByPlaceholder("Tell us more...", {
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
  async submitReview(args: { rating: number; message: string }) {
    const { rating, message } = args;
    await expect(this.title).toBeVisible();
    await this.dialog
      .getByRole("button", { name: rating.toString(), exact: true })
      .click();
    await this.messageTextarea.fill(message);
    await this.submitButton.click();
    await expect(this.title).not.toBeVisible();
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
