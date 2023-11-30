import { Locator, Page } from "@playwright/test";

export class Menu {
  readonly page: Page;
  readonly menu: Locator;
  readonly pageTypesLink: Locator;
  readonly customTypesLink: Locator;
  readonly slicesLink: Locator;
  readonly changesLink: Locator;
  readonly tutorialLink: Locator;
  readonly changelogLink: Locator;
  readonly appVersion: Locator;

  constructor(page: Page) {
    /**
     * Components
     */
    this.page = page;

    /**
     * Static locators
     */
    this.menu = page.getByRole("navigation");
    this.pageTypesLink = this.menu.getByRole("link", {
      name: "Page types",
      exact: true,
    });
    this.customTypesLink = this.menu.getByRole("link", {
      name: "Custom types",
      exact: true,
    });
    this.slicesLink = this.menu.getByRole("link", {
      name: "Slices",
      exact: true,
    });
    this.changesLink = this.menu.getByRole("link", { name: "Changes" });
    this.tutorialLink = this.menu.getByRole("link", {
      name: "Tutorials",
      exact: true,
    });
    this.changelogLink = this.menu.getByRole("link", { name: "Changelog" });
    this.appVersion = this.menu.getByTestId("slicemachine-version");
  }

  /**
   * Dynamic locators
   */
  // Handle dynamic locators here

  /**
   * Actions
   */
  // Handle actions here

  /**
   * Assertions
   */
  // Handle assertions here
}
