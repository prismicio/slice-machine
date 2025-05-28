import { Locator, Page } from "@playwright/test";

import { EnvironmentSelector } from "./EnvironmentSelector";

export class Menu {
  readonly page: Page;
  readonly menu: Locator;
  readonly environmentSelector: EnvironmentSelector;
  readonly repositoryLink: Locator;
  readonly pageTypesLink: Locator;
  readonly customTypesLink: Locator;
  readonly slicesLink: Locator;
  readonly changesLink: Locator;
  readonly documentationLink: Locator;
  readonly settingsLink: Locator;
  readonly changelogLink: Locator;
  readonly appVersion: Locator;
  readonly updatesAvailableTitle: Locator;
  readonly updatesAvailableButton: Locator;
  readonly tutorialVideoTooltipTitle: Locator;
  readonly tutorialVideoTooltipCloseButton: Locator;
  readonly autoSyncSyncing: Locator;
  readonly autoSyncSynced: Locator;
  readonly autoSyncFailed: Locator;
  readonly autoSyncFailedMessage: Locator;
  readonly autoSyncFailedRetry: Locator;
  readonly fieldAddedSuccessMessage: Locator;
  readonly groupAddedSuccessMessage: Locator;

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
    this.repositoryLink = this.menu.getByTestId("prismic-repository-link");
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
    this.changesLink = this.menu.getByRole("button", {
      name: "Review changes",
    });
    this.documentationLink = this.menu.getByRole("link", {
      name: "Documentation",
      exact: true,
    });
    this.settingsLink = this.menu.getByRole("link", {
      name: "Settings",
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
    this.autoSyncSyncing = page.getByText("Syncing...", { exact: true });
    this.autoSyncSynced = page.getByText("Synced", { exact: true });
    this.autoSyncFailed = page.getByText("Sync failed", { exact: true });
    this.autoSyncFailedMessage = page.getByText(
      "Failed to sync changes. Check your browser's console for more information.",
      { exact: true },
    );
    this.autoSyncFailedRetry = page.getByRole("button", { name: "Retry" });
    this.fieldAddedSuccessMessage = page.getByText("Field added", {
      exact: true,
    });
    this.groupAddedSuccessMessage = page.getByText("Group added", {
      exact: true,
    });
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
