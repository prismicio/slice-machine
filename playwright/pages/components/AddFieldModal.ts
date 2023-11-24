import { expect, Locator, Page } from "@playwright/test";

import { FieldType } from "../shared/BuilderPage";

export class AddFieldModal {
  readonly page: Page;

  readonly title: Locator;

  constructor(page: Page) {
    /**
     * Components
     */
    this.page = page;

    /**
     * Static locators
     */
    this.title = page.getByRole("heading", {
      name: "Add a new field",
      exact: true,
    });
  }

  /**
   * Dynamic locators
   */
  getField(fieldType: FieldType): Locator {
    return this.page.getByRole("heading", {
      name: fieldType,
      exact: true,
    });
  }

  /**
   * Actions
   */
  async pickField(fieldType: FieldType) {
    await this.getField(fieldType).click();
    await expect(this.title).not.toBeVisible();
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
