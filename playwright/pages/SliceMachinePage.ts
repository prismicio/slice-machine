import { Locator, Page, expect } from "@playwright/test";

import { Menu } from "./components/Menu";
import { LoginDialog } from "./components/LoginDialog";

export class SliceMachinePage {
  readonly page: Page;
  readonly menu: Menu;
  readonly loginDialog: LoginDialog;
  readonly body: Locator;
  readonly breadcrumb: Locator;

  constructor(page: Page) {
    /**
     * Components
     */
    this.page = page;
    this.menu = new Menu(page);
    this.loginDialog = new LoginDialog(page);

    /**
     * Static locators
     */
    this.body = page.getByRole("main");
    this.breadcrumb = page.getByLabel("Breadcrumb");
  }

  /**
   * Dynamic locators
   */
  getPageLayoutByTopBorderColor(color: string) {
    return this.page.getByTestId(`app-layout-top-border-color-${color}`);
  }

  /**
   * Actions
   */
  async gotoDefaultPage() {
    await this.page.goto("/");
    await expect(this.breadcrumb).toBeVisible();
  }

  /**
   * Assertions
   */
  async checkBreadcrumbItems(items: string[]) {
    await expect(this.breadcrumb).toBeVisible();
    await expect(this.breadcrumb).toHaveText(items.join("/"));
  }
}
