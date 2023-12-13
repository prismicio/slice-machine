import { Locator, Page } from "@playwright/test";

import { Menu } from "./components/Menu";
import { InAppGuideDialog } from "./components/InAppGuideDialog";

export class SliceMachinePage {
  readonly page: Page;
  readonly menu: Menu;
  readonly inAppGuideDialog: InAppGuideDialog;
  readonly body: Locator;
  readonly breadcrumb: Locator;

  constructor(page: Page) {
    /**
     * Components
     */
    this.page = page;
    this.menu = new Menu(page);
    this.inAppGuideDialog = new InAppGuideDialog(page);

    /**
     * Static locators
     */
    this.body = page.getByRole("main");
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
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
