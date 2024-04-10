import { expect, Locator, Page } from "@playwright/test";

import { Dialog } from "./Dialog";

export type FieldTypeLabel =
  | "Rich Text"
  | "Image"
  | "Link"
  | "Link to media"
  | "Content Relationship"
  | "Select"
  | "Boolean"
  | "Date"
  | "Timestamp"
  | "Embed"
  | "Number"
  | "GeoPoint"
  | "Color"
  | "Key Text"
  | "Group"
  | "Repeatable Group";

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
  getField(fieldType: FieldTypeLabel): Locator {
    return this.dialog.getByRole("heading", {
      name: fieldType,
      exact: true,
    });
  }

  /**
   * Actions
   */
  async selectField(fieldType: FieldTypeLabel) {
    await this.getField(fieldType).click();
    await expect(this.title).not.toBeVisible();
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
