import { expect, Locator, Page } from "@playwright/test";

import { FieldType } from "../shared/BuilderPage";
import { Dialog } from "./Dialog";

export class AddFieldDialog extends Dialog {
  constructor(page: Page) {
    super(page, {
      title: "Add a new field",
    });

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
  getField(fieldType: FieldType): Locator {
    return this.dialog.getByRole("heading", {
      name: fieldType,
      exact: true,
    });
  }

  /**
   * Actions
   */
  async selectField(fieldType: FieldType) {
    await this.getField(fieldType).click();
    await expect(this.title).not.toBeVisible();
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
