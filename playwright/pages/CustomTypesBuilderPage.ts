import { Page } from "@playwright/test";

import { TypeBuilderPage } from "./shared/TypeBuilderPage";

export class CustomTypesBuilderPage extends TypeBuilderPage {
  constructor(page: Page) {
    super(page, {
      format: "custom",
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
