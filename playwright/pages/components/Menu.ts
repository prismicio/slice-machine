import { Locator, Page } from "@playwright/test";

export class Menu {
  readonly page: Page;
  readonly menu: Locator;
  readonly appHeader: Locator;
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
    this.appHeader = this.menu.locator("h5", { hasText: "Slice Machine" });
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
    this.appVersion = this.menu.locator(
      'a[href="/changelog"] > div:nth-child(2)',
    );
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
