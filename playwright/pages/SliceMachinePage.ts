import { Locator, Page, expect } from "@playwright/test";

import { Menu } from "./components/Menu";
import { ReviewDialog } from "./components/ReviewDialog";
import { InAppGuideDialog } from "./components/InAppGuideDialog";
import { LoginDialog } from "./components/LoginDialog";

export class SliceMachinePage {
  readonly page: Page;
  readonly appLayout: Locator;
  readonly menu: Menu;
  readonly reviewDialog: ReviewDialog;
  readonly inAppGuideDialog: InAppGuideDialog;
  readonly loginDialog: LoginDialog;
  readonly body: Locator;
  readonly breadcrumb: Locator;

  constructor(page: Page) {
    /**
     * Components
     */
    this.page = page;
    this.menu = new Menu(page);
    this.reviewDialog = new ReviewDialog(page);
    this.inAppGuideDialog = new InAppGuideDialog(page);
    this.loginDialog = new LoginDialog(page);

    /**
     * Static locators
     */
    this.body = page.getByRole("main");
    this.appLayout = page.getByTestId("app-layout");
    this.breadcrumb = page.getByLabel("Breadcrumb");
  }

  /**
   * Dynamic locators
   */
  getBreadcrumbLabel(name: string) {
    return this.breadcrumb.getByText(name, { exact: true });
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
  // Handle assertions here
}
