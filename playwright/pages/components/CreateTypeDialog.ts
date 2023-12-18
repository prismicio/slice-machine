import { expect, Locator, Page } from "@playwright/test";

import { Dialog } from "./Dialog";

export class CreateTypeDialog extends Dialog {
  readonly createdMessage: Locator;
  readonly reusableTypeRadio: Locator;
  readonly singleTypeRadio: Locator;
  readonly singleTypeButton: Locator;
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
      { exact: false },
    );

    this.reusableTypeRadio = this.dialog.getByTestId(
      "repeatable-type-radio-btn",
    );
    this.singleTypeRadio = this.dialog.getByTestId("single-type-radio-btn");
    this.singleTypeButton = this.dialog.getByText("Single type", {
      exact: false,
    });
    this.nameInput = this.dialog.getByTestId("ct-name-input");
  }

  /**
   * Dynamic locators
   */
  // Handle dynamic locators here

  /**
   * Actions
   */
  async createType(name: string, type: "single" | "reusable") {
    await expect(this.title).toBeVisible();
    await expect(this.reusableTypeRadio).toBeChecked();
    if (type === "single") {
      await this.singleTypeButton.click();
      await expect(this.singleTypeRadio).toBeChecked();
    }
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
