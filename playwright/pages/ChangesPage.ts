import { Locator, Page, expect } from "@playwright/test";

import { LoginDialog } from "./components/LoginDialog";
import { SliceMachinePage } from "./components/SliceMachinePage";

export class ChangesPage extends SliceMachinePage {
  readonly loginDialog: LoginDialog;

  readonly breadcrumbLabel: Locator;

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
  }

  /**
   * Dynamic locators
   */
  // Handle dynamic locators here

  /**
   * Actions
   */
  async goto() {
    await this.page.goto("/changes");
    await expect(this.breadcrumb).toBeVisible();
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
