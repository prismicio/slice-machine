import { Locator, Page } from "@playwright/test";

export class Menu {
  readonly page: Page;

  readonly root: Locator;
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
    this.root = page.getByRole("navigation");
    this.appHeader = this.root.locator("h5", { hasText: "Slice Machine" });
    this.pageTypesLink = this.root.getByRole("link", {
      name: "Page types",
      exact: true,
    });
    this.customTypesLink = this.root.getByRole("link", {
      name: "Custom types",
      exact: true,
    });
    this.slicesLink = this.root.getByRole("link", {
      name: "Slices",
      exact: true,
    });
    this.changesLink = this.root.getByRole("link", { name: "Changes" });
    this.tutorialLink = this.root.getByRole("link", {
      name: "Tutorials",
      exact: true,
    });
    this.changelogLink = this.page.getByRole("link", { name: "Changelog" });
    this.appVersion = this.root.locator(
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
