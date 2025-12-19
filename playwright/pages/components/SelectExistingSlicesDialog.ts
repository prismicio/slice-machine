import { expect, Locator, Page } from "@playwright/test";

import { Dialog } from "./Dialog";

export class SelectExistingSlicesDialog extends Dialog {
  readonly sharedSliceCard: Locator;
  readonly addedMessage: Locator;

  constructor(page: Page) {
    super(page, {
      title: "Reuse an existing slice",
      submitName: "Add",
    });

    /**
     * Static locators
     */
    this.sharedSliceCard = this.dialog.getByTestId("shared-slice-card");
    this.addedMessage = page.getByText("Slices successfully added", {
      exact: true,
    });
    this.submitButton = this.dialog.getByRole("button", {
      // Match "Add to <slice zone name> (<number of slices>)"
      name: new RegExp(`^Add to .+ \\(\\d+\\)$`),
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
  async selectExistingSlices(names: string[]) {
    await expect(this.title).toBeVisible();
    for (const name of names) {
      await this.sharedSliceCard.getByText(name, { exact: true }).click();
    }
    await this.submitButton.click();
    await this.checkCreatedMessage();
    await expect(this.title).not.toBeVisible();
  }

  /**
   * Assertions
   */
  async checkCreatedMessage() {
    await expect(this.addedMessage).toBeVisible();
    await expect(this.addedMessage).not.toBeVisible();
  }
}
