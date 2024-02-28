import { type Locator, type Page, expect } from "@playwright/test";

import { GitRepositoryConnectDialog } from "./components/GitRepositoryConnectDialog";
import { GitRepositoryDisconnectDialog } from "./components/GitRepositoryDisconnectDialog";
import { SliceMachinePage } from "./SliceMachinePage";

export class SettingsPage extends SliceMachinePage {
  readonly gitRepositoryConnectDialog: GitRepositoryConnectDialog;
  readonly gitRepositoryDisconnectDialog: GitRepositoryDisconnectDialog;
  readonly breadcrumbLabel: Locator;
  readonly installGitHubButton: Locator;
  readonly unauthenticatedErrorTitle: Locator;
  readonly unauthorizedErrorTitle: Locator;
  readonly unknownErrorTitle: Locator;

  constructor(page: Page) {
    super(page);

    /**
     * Components
     */
    // Handle components here
    this.gitRepositoryConnectDialog = new GitRepositoryConnectDialog(page);
    this.gitRepositoryDisconnectDialog = new GitRepositoryDisconnectDialog(
      page,
    );

    /**
     * Static locators
     */
    // Handle static locators here
    this.breadcrumbLabel = this.breadcrumb.getByText("Settings", {
      exact: true,
    });
    this.installGitHubButton = page.getByRole("button", {
      name: "GitHub",
      exact: true,
    });
    this.unauthenticatedErrorTitle = page.getByText(
      "It seems like you are logged out",
      { exact: true },
    );
    this.unauthorizedErrorTitle = page.getByText(
      "It seems like you do not have permission",
      { exact: true },
    );
    this.unknownErrorTitle = page.getByText("Unable to fetch data", {
      exact: true,
    });
  }

  /**
   * Dynamic locators
   */
  // Handle dynamic locators here
  getConnectGitRepoButton(name: string): Locator {
    return this.page
      .getByRole("listitem")
      .filter({ hasText: name })
      .getByRole("button", { name: "Connect", exact: true });
  }

  getDisconnectGitRepoButton(name: string): Locator {
    return this.page
      .getByRole("listitem")
      .filter({ hasText: name })
      .getByRole("button", { name: "Disconnect", exact: true });
  }

  /**
   * Actions
   */
  // Handle actions here
  async goto() {
    await this.page.goto("/settings");
    await expect(this.breadcrumbLabel).toBeVisible();
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
