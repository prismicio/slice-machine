import { expect, Locator, Page } from "@playwright/test";

import { Dialog } from "./Dialog";

export class UseTemplateSlicesDialog extends Dialog {
  readonly sharedSliceCard: Locator;
  readonly addedMessage: Locator;

  constructor(page: Page) {
    super(page, {
      title: `Use template slices`,
      submitName: "Add",
    });

    /**
     * Static locators
     */
    this.sharedSliceCard = this.dialog.getByTestId("shared-slice-card");
    this.addedMessage = page.getByText(
      "Slice template(s) added to slice zone",
      { exact: false },
    );
  }

  /**
   * Dynamic locators
   */
  // Handle dynamic locators here

  /**
   * Actions
   */
  async useTemplates(names: string[]) {
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
