import { Locator, Page } from "@playwright/test";

export class Modal {
  readonly page: Page;

  readonly root: Locator;
  readonly title: Locator;
  readonly closeButton: Locator;
  readonly cancelButton: Locator;
  readonly submitButton: Locator;

  constructor(page: Page, title: string | RegExp, submitName: string) {
    /**
     * Components
     */
    this.page = page;

    /**
     * Static locators
     */
    this.root = page.getByRole("dialog");
    this.title = this.root.getByRole("heading", { name: title, exact: true });
    this.closeButton = this.root.getByRole("button", {
      name: "Close",
      exact: true,
    });
    this.cancelButton = this.root.getByRole("button", {
      name: "Cancel",
      exact: true,
    });
    this.submitButton = this.root.getByRole("button", {
      name: submitName,
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
  // Handle actions here

  /**
   * Assertions
   */
  // Handle assertions here
}
