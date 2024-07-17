import { expect, Locator, Page } from "@playwright/test";

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
  | "Geopoint"
  | "Color"
  | "Key Text"
  | "Repeatable group";

export type GroupFieldTemplateLabel = "Simple group" | "Advanced group";
const groupFieldTemplateLabels = ["Simple group", "Advanced group"];

export class AddFieldDropdown {
  readonly page: Page;
  readonly menu: Locator;

  constructor(page: Page) {
    /**
     * Components
     */
    this.page = page;
    this.menu = page.getByRole("menu");

    /**
     * Static locators
     */
    // Handle static locators here
  }

  /**
   * Dynamic locators
   */
  getField(fieldType: FieldTypeLabel | GroupFieldTemplateLabel): Locator {
    const fieldLabel = groupFieldTemplateLabels.includes(fieldType)
      ? `${fieldType} ⋅ Template`
      : fieldType;
    return this.menu.getByRole("menuitem").getByText(fieldLabel, {
      exact: true,
    });
  }

  /**
   * Actions
   */
  async selectField(fieldType: FieldTypeLabel | GroupFieldTemplateLabel) {
    await this.getField(fieldType).click();
    await expect(this.menu).not.toBeVisible();
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
