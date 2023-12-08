import { Locator, Page } from "@playwright/test";

import { Menu } from "./components/Menu";
import { InAppGuideDialog } from "./components/InAppGuideDialog";
import { EnvironmentSelector } from "./components/EnvironmentSelector";
import { LoginDialog } from "./components/LoginDialog";

export class SliceMachinePage {
  readonly page: Page;
  readonly topBorder: Locator;
  readonly menu: Menu;
  readonly inAppGuideDialog: InAppGuideDialog;
  readonly environmentSelector: EnvironmentSelector;
  readonly loginDialog: LoginDialog;
  readonly body: Locator;
  readonly breadcrumb: Locator;

  constructor(page: Page) {
    /**
     * Components
     */
    this.page = page;
    this.menu = new Menu(page);
    this.inAppGuideDialog = new InAppGuideDialog(page);
    this.environmentSelector = new EnvironmentSelector(page);
    this.loginDialog = new LoginDialog(page);

    /**
     * Static locators
     */
    this.body = page.getByRole("main");
    this.topBorder = page.getByTestId("top-border");
    this.breadcrumb = page.getByLabel("Breadcrumb");
  }

  /**
   * Dynamic locators
   */
  // Handle dynamic locators here

  /**
   * Actions
   */
  async gotoDefaultPage() {
    await this.page.goto("/");
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
