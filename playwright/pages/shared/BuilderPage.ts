import { expect, Locator, Page } from "@playwright/test";

import { AddFieldModal } from "../components/AddFieldModal";
import { Menu } from "../components/Menu";

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

export class BuilderPage {
  readonly page: Page;
  readonly menu: Menu;
  readonly addFieldModal: AddFieldModal;

  readonly breadcrumb: Locator;
  readonly saveButton: Locator;
  readonly showCodeSnippetsButton: Locator;
  readonly hideCodeSnippetsButton: Locator;
  readonly addFieldButton: Locator;
  readonly newFieldNameInput: Locator;
  readonly newFieldIdInput: Locator;
  readonly newFieldAddButton: Locator;

  constructor(page: Page) {
    /**
     * Components
     */
    this.page = page;
    this.menu = new Menu(page);
    this.addFieldModal = new AddFieldModal(page);

    /**
     * Static locators
     */
    // global
    this.breadcrumb = page.getByLabel("Breadcrumb");
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
    await expect(this.addFieldModal.title).toBeVisible();
    await this.addFieldModal.pickField(type);
    await this.newFieldNameInput.fill(name);
    await expect(this.newFieldIdInput).toHaveValue(expectedId);
    await this.newFieldAddButton.click();
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
