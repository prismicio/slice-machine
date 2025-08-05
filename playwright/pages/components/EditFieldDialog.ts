import { Locator, Page, expect } from "@playwright/test";

import { Dialog } from "./Dialog";

export class EditFieldDialog extends Dialog {
  readonly labelInput: Locator;
  readonly apiIdInput: Locator;

  constructor(page: Page) {
    super(page, {
      title: page.getByTestId("item-header-text"),
      submitName: "Done",
    });

    /**
     * Components
     */
    // Handle components here

    /**
     * Static locators
     */
    this.labelInput = this.dialog.getByPlaceholder(
      "Label for content creators (defaults to field type)",
      { exact: true },
    );
    this.apiIdInput = this.dialog.getByPlaceholder(
      "A unique identifier for the field (e.g. buttonLink)",
      { exact: true },
    );
  }

  /**
   * Dynamic locators
   */
  getLabel() {
    return this.dialog.locator('input[name="config.label"]').inputValue();
  }

  getFieldByLabel(label: string) {
    return this.dialog.getByLabel(label, { exact: true });
  }

  /**
   * Actions
   */
  async editField(args: { name: string; newName: string; newId: string }) {
    const { name, newName, newId } = args;

    expect(await this.getLabel()).toEqual(name);
    await this.labelInput.fill(newName);
    expect(await this.getLabel()).toEqual(newName);
    await this.apiIdInput.fill(newId);
    await this.submitButton.click();
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
