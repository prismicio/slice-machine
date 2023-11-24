import { Page } from "@playwright/test";

import { TypesTablePage } from "./shared/TypesTablePage";

export class CustomTypesTablePage extends TypesTablePage {
  constructor(page: Page) {
    super(page, "custom", "Custom types", "/custom-types");

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
  // Handle dynamic locators here

  /**
   * Actions
   */
  // Handle actions here

  /**
   * Assertions
   */
  // Handle assertions here
}
