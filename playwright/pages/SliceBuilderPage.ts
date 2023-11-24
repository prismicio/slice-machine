import { expect, Locator, Page } from "@playwright/test";

import { BuilderPage } from "./shared/BuilderPage";

export class SliceBuilderPage extends BuilderPage {
  readonly savedMessage: Locator;
  readonly staticZone: Locator;
  readonly staticZonePlaceholder: Locator;
  readonly staticZoneListItem: Locator;
  readonly repeatableZone: Locator;
  readonly repeatableZonePlaceholder: Locator;
  readonly repeatableZoneListItem: Locator;

  constructor(page: Page) {
    super(page);

    /**
     * Components
     */
    // Handle components here

    /**
     * Static locators
     */
    // Global
    this.savedMessage = page.getByText("Slice saved successfully");
    // Static zone
    this.staticZone = page.getByTestId("slice-non-repeatable-zone");
    this.staticZonePlaceholder = page.getByText(
      "Add a field to your Static Zone",
    );
    this.staticZoneListItem = this.staticZone.getByRole("listitem");
    // Repeatable zone
    this.repeatableZone = page.getByTestId("slice-repeatable-zone");
    this.repeatableZonePlaceholder = page.getByText(
      "Add a field to your Repeatable Zone",
    );
    this.repeatableZoneListItem = this.repeatableZone.getByRole("listitem");
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
  async checkSavedMessage() {
    await expect(this.savedMessage).toBeVisible();
    await expect(this.savedMessage).not.toBeVisible();
  }
}
