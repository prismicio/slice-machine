import { type Locator, type Page, expect } from "@playwright/test";

import { GitRepositoryConnectDialog } from "./components/GitRepositoryConnectDialog";
import { GitRepositoryDisconnectDialog } from "./components/GitRepositoryDisconnectDialog";
import { SliceMachinePage } from "./SliceMachinePage";

export class SettingsPage extends SliceMachinePage {
  readonly breadcrumbLabel: Locator;
  readonly installGitHubButton: Locator;
  readonly gitRepositoryConnectDialog: GitRepositoryConnectDialog;
  readonly gitRepositoryDisconnectDialog: GitRepositoryDisconnectDialog;
  readonly unauthenticatedErrorTitle: Locator;
  readonly unauthorizedErrorTitle: Locator;
  readonly unknownErrorTitle: Locator;

  constructor(page: Page) {
    super(page);

    /**
     * Components
     */

    /**
     * Static locators
     */
    this.breadcrumbLabel = this.breadcrumb.getByText("Settings", {
      exact: true,
    });
    this.installGitHubButton = page.getByRole("button", {
      name: "GitHub",
      exact: true,
    });
    this.gitRepositoryConnectDialog = new GitRepositoryConnectDialog(page);
    this.gitRepositoryDisconnectDialog = new GitRepositoryDisconnectDialog(
      page,
    );
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
  getConnectGitRepoButton(name: string): Locator {
    return this.page
      .locator("div", { hasText: name })
      .getByRole("button", { name: "Connect", exact: true });
  }

  getDisconnectGitRepoButton(name: string): Locator {
    return this.page
      .locator("div", { hasText: name })
      .getByRole("button", { name: "Disconnect", exact: true });
  }

  /**
   * Actions
   */
  async goto() {
    await this.page.goto("/settings");
    await expect(this.breadcrumbLabel).toBeVisible();
  }

  /**
   * Assertions
   */
}
