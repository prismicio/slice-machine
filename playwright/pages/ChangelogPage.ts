import { Locator, Page, expect } from "@playwright/test";

import { SliceMachinePage } from "./SliceMachinePage";

export class ChangelogPage extends SliceMachinePage {
  readonly path: string;
  readonly breadcrumbLabel: Locator;
  readonly breakingChangesWarning: Locator;

  constructor(page: Page) {
    super(page);

    /**
     * Components
     */
    // Handle components here

    /**
     * Static locators
     */
    this.path = "/changelog";
    this.breadcrumbLabel = this.body.getByText("Changelog", { exact: true });
    this.breakingChangesWarning = this.body.getByText(
      "This update includes breaking changes. To update correctly, follow the steps below.",
      { exact: true },
    );
  }

  /**
   * Dynamic locators
   */
  getUpdateCommand(args: {
    packageManager: string;
    adapterName: string;
    version: string;
  }) {
    const { packageManager, adapterName, version } = args;
    let updateCommand;
    if (packageManager == "yarn") {
      updateCommand = `yarn add --dev slice-machine-ui@${version} ${adapterName}@${version}`;
    } else {
      updateCommand = `npm install --save-dev slice-machine-ui@${version} ${adapterName}@${version}`;
    }
    return this.body.getByText(updateCommand, { exact: true });
  }

  /**
   * Actions
   */
  async goto() {
    await this.page.goto(this.path);
  }

  async selectVersion(version: string) {
    await this.body.getByText(version, { exact: true }).click();
  }

  /**
   * Assertions
   */
  async checkReleaseNotes(releaseNotes: string) {
    await expect(
      this.body.getByText(releaseNotes, { exact: true }),
    ).toBeVisible();
  }
}
