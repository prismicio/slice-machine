import { Locator, Page } from "@playwright/test";

export class Modal {
  readonly page: Page;
  readonly modal: Locator;
  readonly title: Locator;
  readonly closeButton: Locator;
  readonly cancelButton: Locator;
  readonly submitButton: Locator;

  constructor(page: Page, title: string | RegExp, submitName?: string) {
    /**
     * Components
     */
    this.page = page;

    /**
     * Static locators
     */
    this.modal = page.getByRole("dialog");
    this.title = this.modal.getByRole("heading", { name: title, exact: true });
    this.closeButton = this.modal.getByRole("button", {
      name: "Close",
      exact: true,
    });
    this.cancelButton = this.modal.getByRole("button", {
      name: "Cancel",
      exact: true,
    });
    this.submitButton = this.modal.getByRole("button", {
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
