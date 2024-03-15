import { Locator, Page } from "@playwright/test";

import { SliceMachinePage } from "./SliceMachinePage";

export class SimulatorPage extends SliceMachinePage {
  readonly saveMockButton: Locator;
  readonly saveMockSuccessMessage: Locator;

  constructor(page: Page) {
    super(page);

    /**
     * Components
     */
    // Handle components here

    /**
     * Static locators
     */
    this.saveMockButton = page.getByRole("button", {
      name: "Save mock content",
      exact: true,
    });
    this.saveMockSuccessMessage = page.getByText("Saved", { exact: true });
  }

  /**
   * Dynamic locators
   */
  getHeadingFieldByContent(content: string) {
    return this.page.getByRole("heading", { name: content, exact: true });
  }

  /**
   * Actions
   */
  // Handle actions here

  /**
   * Assertions
   */
  // Handle assertions here
}
