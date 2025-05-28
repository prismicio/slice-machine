import { Locator, Page, expect } from "@playwright/test";

import { SliceMachinePage } from "./SliceMachinePage";
import { UpdateScreenshotDialog } from "./components/UpdateScreenshotDialog";

export class ChangesPage extends SliceMachinePage {
  readonly updateScreenshotDialog: UpdateScreenshotDialog;
  readonly breadcrumbLabel: Locator;
  readonly loginButton: Locator;
  readonly pushChangesButton: Locator;
  readonly pushedMessaged: Locator;
  readonly notLoggedInTitle: Locator;
  readonly notAuthorizedTitle: Locator;
  readonly blankSlateTitle: Locator;
  readonly postPushBlankSlateTitle: Locator;
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
    this.updateScreenshotDialog = new UpdateScreenshotDialog(page);

    /**
     * Static locators
     */
    this.breadcrumbLabel = this.breadcrumb.getByText("Changes", {
      exact: true,
    });
    this.loginButton = this.body.getByText("Log in to Prismic", {
      exact: true,
    });
    this.pushChangesButton = page.getByText("Push", { exact: true });
    this.pushedMessaged = page.getByText("Your changes have been pushed.", {
      exact: true,
    });
    this.notLoggedInTitle = page.getByText("It seems like you are logged out", {
      exact: true,
    });
    this.notAuthorizedTitle = page.getByText(
      "It seems like you don't have access to this repository",
      { exact: true },
    );
    this.blankSlateTitle = page.getByText("Everything is up-to-date", {
      exact: true,
    });
    this.postPushBlankSlateTitle = page.getByText(
      "Success! Your changes have been pushed to the Page Builder.",
      { exact: true },
    );
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

  getSliceCard(name: string, variation = "Default") {
    return this.page.getByLabel(`${name} ${variation} slice card`, {
      exact: true,
    });
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
    await expect(this.postPushBlankSlateTitle).toBeVisible();
  }

  async confirmDeleteDocuments() {
    await this.softLimitCheckbox.click();
    await this.softLimitButton.click();
    await expect(this.softLimitTitle).not.toBeVisible();
    await this.checkPushedMessage();
  }

  async openUpdateSliceScreenshotDialog(name: string, variation?: string) {
    await this.getSliceCard(name, variation)
      .getByRole("button", { name: "Update screenshot", exact: true })
      .click();
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

  async checkSliceName(name: string) {
    await expect(
      this.getSliceCard(name).getByText(name, { exact: true }),
    ).toBeVisible();
  }

  async checkSliceStatus(name: string, status: string) {
    await expect(
      this.getSliceCard(name).getByText(status, { exact: true }),
    ).toBeVisible();
  }

  async checkPushedMessage() {
    await expect(this.pushedMessaged).toBeVisible();
    await expect(this.pushedMessaged).not.toBeVisible();
  }
}
