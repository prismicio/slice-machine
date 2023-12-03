import { Locator, Page, expect } from "@playwright/test";

import { LoginDialog } from "./components/LoginDialog";
import { SliceMachinePage } from "./SliceMachinePage";

export class ChangesPage extends SliceMachinePage {
  readonly loginDialog: LoginDialog;
  readonly breadcrumbLabel: Locator;
  readonly loginButton: Locator;
  readonly pushChangesButton: Locator;
  readonly pushedMessaged: Locator;
  readonly notLoggedInTitle: Locator;
  readonly notAuthorizedTitle: Locator;
  readonly blankSlateTitle: Locator;

  constructor(page: Page) {
    super(page);

    /**
     * Components
     */
    this.loginDialog = new LoginDialog(page);

    /**
     * Static locators
     */
    this.breadcrumbLabel = this.breadcrumb.getByText("Changes");
    this.loginButton = this.body.getByText("Log in to Prismic");
    this.pushChangesButton = page.getByText("Push Changes");
    this.pushedMessaged = page.getByText(
      "All slices and types have been pushed",
    );
    this.notLoggedInTitle = page.getByText("It seems like you are logged out");
    this.notAuthorizedTitle = page.getByText(
      "It seems like you don't have access to this repository",
    );
    this.blankSlateTitle = page.getByText("Everything up-to-date");
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
    await expect(this.pushedMessaged).toBeVisible();
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
}
