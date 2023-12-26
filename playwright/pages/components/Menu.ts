import { Locator, Page } from "@playwright/test";

import { EnvironmentSelector } from "./EnvironmentSelector";

export class Menu {
  readonly page: Page;
  readonly menu: Locator;
  readonly environmentSelector: EnvironmentSelector;
  readonly pageTypesLink: Locator;
  readonly customTypesLink: Locator;
  readonly slicesLink: Locator;
  readonly changesLink: Locator;
  readonly tutorialLink: Locator;
  readonly changelogLink: Locator;
  readonly appVersion: Locator;
  readonly updatesAvailableTitle: Locator;
  readonly updatesAvailableButton: Locator;
  readonly tutorialVideoTooltipTitle: Locator;
  readonly tutorialVideoTooltipCloseButton: Locator;

  constructor(page: Page) {
    /**
     * Components
     */
    this.page = page;

    /**
     * Static locators
     */
    this.environmentSelector = new EnvironmentSelector(page);
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
    this.changelogLink = this.menu.getByRole("link", {
      name: "Changelog",
      exact: false,
    });
    this.appVersion = this.menu.getByTestId("slicemachine-version");
    this.updatesAvailableTitle = this.menu.getByText("Updates Available", {
      exact: true,
    });
    this.updatesAvailableButton = this.menu.getByText("Learn more", {
      exact: true,
    });
    this.tutorialVideoTooltipTitle = page.getByText("Need Help?");
    this.tutorialVideoTooltipCloseButton = page.getByText("Got it");
  }

  /**
   * Dynamic locators
   */
  getAppVersion(appVersion: string) {
    return this.appVersion.getByText(`v${appVersion}`, { exact: true });
  }

  /**
   * Actions
   */
  // Handle actions here

  /**
   * Assertions
   */
  // Handle assertions here
}
