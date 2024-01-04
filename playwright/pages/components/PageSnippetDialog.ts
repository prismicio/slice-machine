import { Locator, Page, expect } from "@playwright/test";

import { Dialog } from "./Dialog";

export class PageSnippetDialog extends Dialog {
  readonly copyIconButton: Locator;
  readonly copiedIconButton: Locator;

  constructor(page: Page) {
    super(page, {
      title: "Page snippet",
    });

    /**
     * Components
     */
    // Handle components here

    /**
     * Static locators
     */
    this.copyIconButton = this.dialog.getByRole("button", {
      name: "Copy code",
      exact: true,
    });
    this.copiedIconButton = this.dialog.getByRole("button", {
      name: "Code successfully copied",
      exact: true,
    });
  }

  /**
   * Dynamic locators
   */
  // Handle dynamic locators here

  /**
   * Actions
   */
  async copyPageSnippet() {
    await this.copyIconButton.click();

    const handle = await this.page.evaluateHandle(() =>
      navigator.clipboard.readText(),
    );
    const clipboardContent = await handle.jsonValue();
    expect(clipboardContent).toContain("prismicio");

    await expect(this.copiedIconButton).toBeVisible();
    await expect(this.copyIconButton).toBeVisible();
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
