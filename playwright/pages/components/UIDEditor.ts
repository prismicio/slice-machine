import { Locator, Page } from "@playwright/test";

export class UIDEditor {
  readonly page: Page;
  readonly dialog: Locator;
  readonly input: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    /**
     * Components
     */
    this.page = page;

    /**
     * Static locators
     */
    this.dialog = page.getByRole("dialog");
    this.input = this.dialog.getByRole("textbox", {
      name: "Label *",
      exact: true,
    });
    this.saveButton = this.dialog.getByRole("button", {
      name: "Save",
      exact: true,
    });
  }

  /**
   * Dynamic locators
   */

  getDialogTrigger(label: string): Locator {
    return this.page.getByRole("button", { name: label, exact: true });
  }

  /**
   * Actions
   */
  async editUID(label: string) {
    await this.input.fill(label);
    await this.saveButton.click();
  }
}
