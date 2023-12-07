import { Locator, Page } from "@playwright/test";

export class Dialog {
  readonly page: Page;
  readonly dialog: Locator;
  readonly title: Locator;
  readonly closeButton: Locator;
  readonly cancelButton: Locator;
  readonly submitButton: Locator;

  constructor(
    page: Page,
    options: {
      title: string | RegExp;
      submitName?: string;
    },
  ) {
    const { title, submitName = "Submit" } = options;

    /**
     * Components
     */
    this.page = page;

    /**
     * Static locators
     */
    this.dialog = page.getByRole("dialog");
    this.title = this.dialog.getByText(title, { exact: true });
    this.closeButton = this.dialog.getByRole("button", {
      name: "Close",
      exact: true,
    });
    this.cancelButton = this.dialog.getByRole("button", {
      name: "Cancel",
      exact: true,
    });
    this.submitButton = this.dialog.getByRole("button", {
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
