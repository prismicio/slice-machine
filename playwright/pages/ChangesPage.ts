import { Locator, Page, expect } from "@playwright/test";

import { SliceMachinePage } from "./SliceMachinePage";

export class ChangesPage extends SliceMachinePage {
  readonly breadcrumbLabel: Locator;
  readonly loginButton: Locator;
  readonly pushChangesButton: Locator;
  readonly pushedMessaged: Locator;
  readonly notLoggedInTitle: Locator;
  readonly notAuthorizedTitle: Locator;
  readonly blankSlateTitle: Locator;
  readonly unknownErrorMessage: Locator;
  readonly softLimitTitle: Locator;
  readonly softLimitCheckbox: Locator;
  readonly softLimitButton: Locator;
  readonly hardLimitTitle: Locator;
  readonly hardLimitButton: Locator;

  constructor(page: Page) {
    super(page);

    /**
     * Components
     */

    /**
     * Static locators
     */
    this.breadcrumbLabel = this.breadcrumb.getByText("Changes", {
      exact: true,
    });
    this.loginButton = this.body.getByText("Log in to Prismic", {
      exact: true,
    });
    this.pushChangesButton = page.getByText("Push Changes", { exact: true });
    this.pushedMessaged = page.getByText(
      "All slices and types have been pushed",
      { exact: true },
    );
    this.notLoggedInTitle = page.getByText("It seems like you are logged out", {
      exact: true,
    });
    this.notAuthorizedTitle = page.getByText(
      "It seems like you don't have access to this repository",
      { exact: true },
    );
    this.blankSlateTitle = page.getByText("Everything up-to-date", {
      exact: true,
    });
    this.unknownErrorMessage = page.getByText(
      "Something went wrong when pushing your changes. Check your terminal logs.",
      {
        exact: true,
      },
    );
    this.softLimitTitle = page.getByText("Confirm deletion", {
      exact: true,
    });
    this.softLimitCheckbox = page.getByText("Delete these Documents", {
      exact: true,
    });
    this.softLimitButton = page.getByRole("button", {
      name: "Push changes",
      exact: true,
    });
    this.hardLimitTitle = page.getByText("Manual action required", {
      exact: true,
    });
    this.hardLimitButton = page.getByRole("button", {
      name: "Try again",
      exact: true,
    });
  }

  /**
   * Dynamic locators
   */
  getCustomType(id: string) {
    return this.page.getByTestId(`custom-type-${id}`);
  }

  /**
   * Actions
   */
  async goto() {
    await this.page.goto("/changes");
    await expect(this.breadcrumbLabel).toBeVisible();
  }

  async pushChanges() {
    await this.pushChangesButton.click();
    await expect(this.pushChangesButton).toBeDisabled();
    await this.checkPushedMessage();
  }

  async confirmDeleteDocuments() {
    await this.softLimitCheckbox.click();
    await this.softLimitButton.click();
    await expect(this.softLimitTitle).not.toBeVisible();
    await this.checkPushedMessage();
  }

  /**
   * Assertions
   */
  async checkCustomTypeName(id: string, name: string) {
    await expect(
      this.getCustomType(id).getByText(name, { exact: true }),
    ).toBeVisible();
  }

  async checkCustomTypeApiId(id: string) {
    await expect(
      this.getCustomType(id).getByText(id, { exact: true }),
    ).toBeVisible();
  }

  async checkCustomTypeStatus(id: string, status: string) {
    await expect(
      this.getCustomType(id).getByText(status, { exact: true }),
    ).toBeVisible();
  }

  async checkPushedMessage() {
    await expect(this.pushedMessaged).toBeVisible();
    await expect(this.pushedMessaged).not.toBeVisible();
  }
}
