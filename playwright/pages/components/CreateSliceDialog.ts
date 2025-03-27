import { expect, Locator, Page } from "@playwright/test";

import { Dialog } from "./Dialog";

export class CreateSliceDialog extends Dialog {
  readonly createdMessageFromTable: Locator;
  readonly createdMessageFromSliceZone: Locator;
  readonly nameInput: Locator;
  readonly sliceAlreadyExistMessage: Locator;

  constructor(page: Page) {
    super(page, {
      title: "Create a new slice",
      submitName: "Create",
    });

    /**
     * Components
     */
    // Handle components here

    /**
     * Static locators
     */
    this.createdMessageFromTable = page.getByText("Slice saved successfully", {
      exact: false,
    });
    this.createdMessageFromSliceZone = page.getByText(
      "Slice(s) added to slice zone",
      { exact: false },
    );
    this.nameInput = this.dialog.getByTestId("slice-name-input");
    this.sliceAlreadyExistMessage = this.dialog.getByText(
      "Slice name is already taken.",
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
  async createSlice(name: string, from: "table" | "sliceZone" = "table") {
    await expect(this.title).toBeVisible();
    await this.nameInput.fill(name);
    await this.submitButton.click();
    await this.checkCreatedMessage(from);
    await expect(this.title).not.toBeVisible();
  }

  /**
   * Assertions
   */
  async checkCreatedMessage(from: "table" | "sliceZone" = "table") {
    if (from === "table") {
      await expect(this.createdMessageFromTable).toBeVisible();
      await expect(this.createdMessageFromTable).not.toBeVisible();
    } else {
      await expect(this.createdMessageFromSliceZone).toBeVisible();
      await expect(this.createdMessageFromSliceZone).not.toBeVisible();
    }
  }
}
