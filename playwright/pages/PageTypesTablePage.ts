import { Page } from "@playwright/test";

import { TypesTablePage } from "./shared/TypesTablePage";

export class PageTypesTablePage extends TypesTablePage {
  constructor(page: Page) {
    super(page, {
      format: "page",
      breadcrumbLabel: "Page types",
      path: "/",
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
