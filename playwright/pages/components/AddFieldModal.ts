import { expect, Locator, Page } from "@playwright/test";

import { FieldType } from "../shared/BuilderPage";
import { Modal } from "./Modal";

export class AddFieldModal extends Modal {
  constructor(page: Page) {
    super(page, "Add a new field");

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
    return this.modal.getByRole("heading", {
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
