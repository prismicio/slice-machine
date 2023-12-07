import { expect, Locator, Page } from "@playwright/test";

import { AddFieldDialog } from "../components/AddFieldDialog";
import { SliceMachinePage } from "../SliceMachinePage";

export type FieldType =
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
  | "Key Text";

export class BuilderPage extends SliceMachinePage {
  readonly addFieldDialog: AddFieldDialog;
  readonly saveButton: Locator;
  readonly showCodeSnippetsButton: Locator;
  readonly hideCodeSnippetsButton: Locator;
  readonly addFieldButton: Locator;
  readonly newFieldNameInput: Locator;
  readonly newFieldIdInput: Locator;
  readonly newFieldAddButton: Locator;

  constructor(page: Page) {
    super(page);

    /**
     * Components
     */
    this.addFieldDialog = new AddFieldDialog(page);

    /**
     * Static locators
     */
    // header
    this.saveButton = page.getByRole("button", { name: "Save", exact: true });
    this.showCodeSnippetsButton = page.getByRole("button", {
      name: "Show code snippets",
      exact: true,
    });
    this.hideCodeSnippetsButton = page.getByRole("button", {
      name: "Hide code snippets",
      exact: true,
    });
    // Static zone
    this.addFieldButton = page.getByTestId("add-Static-field");
    // New field
    this.newFieldNameInput = page.getByPlaceholder("Field Name");
    this.newFieldIdInput = page.getByPlaceholder("e.g. buttonLink");
    this.newFieldAddButton = page.getByRole("button", {
      name: "Add",
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
  async addStaticField(type: FieldType, name: string, expectedId: string) {
    await this.addFieldButton.click();
    await expect(this.addFieldDialog.title).toBeVisible();
    await this.addFieldDialog.selectField(type);
    await this.newFieldNameInput.fill(name);
    await expect(this.newFieldIdInput).toHaveValue(expectedId);
    await this.newFieldAddButton.click();
    await expect(this.addFieldDialog.title).not.toBeVisible();
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
