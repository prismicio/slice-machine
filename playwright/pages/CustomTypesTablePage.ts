import type { Locator, Page } from "@playwright/test";

import { TypesTablePage } from "./shared/TypesTablePage";

export class CustomTypesTablePage extends TypesTablePage {
  readonly convertedMessage: Locator;

  constructor(page: Page) {
    super(page, {
      format: "custom",
      breadcrumbLabel: "Custom types",
      path: "/custom-types",
    });

    /**
     * Components
     */
    // Handle components here

    /**
     * Static locators
     */
    // Handle static locators here
    this.convertedMessage = page.getByText(
      "Custom type converted to page type",
      { exact: true },
    );
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
