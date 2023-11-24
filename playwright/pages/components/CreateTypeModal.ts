import { expect, Locator, Page } from "@playwright/test";

export class CreateTypeModal {
  readonly page: Page;

  readonly root: Locator;
  readonly title: Locator;
  readonly nameInput: Locator;
  readonly closeButton: Locator;
  readonly cancelButton: Locator;
  readonly submitButton: Locator;
  readonly savedMessage: Locator;

  constructor(page: Page, format: "page" | "custom") {
    /**
     * Components
     */
    this.page = page;

    /**
     * Static locators
     */
    this.root = page.getByTestId("create-ct-modal");
    this.title = this.root.getByRole("heading", {
      name: `Create a new ${format} type`,
      exact: true,
    });
    this.nameInput = this.root.getByTestId("ct-name-input");
    this.closeButton = this.root.getByRole("button", {
      name: "Close",
      exact: true,
    });
    this.cancelButton = this.root.getByRole("button", {
      name: "Cancel",
      exact: true,
    });
    this.submitButton = this.root.getByRole("button", {
      name: "Create",
      exact: true,
    });
    this.savedMessage = this.page.getByText("Custom type saved successfully");
  }

  /**
   * Dynamic locators
   */
  // Handle dynamic locators here

  /**
   * Actions
   */
  async createType(name: string) {
    await expect(this.title).toBeVisible();
    await this.nameInput.fill(name);
    await this.submitButton.click();
    await expect(this.title).not.toBeVisible();
    await expect(this.savedMessage).toBeVisible();
    await expect(this.savedMessage).not.toBeVisible();
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
