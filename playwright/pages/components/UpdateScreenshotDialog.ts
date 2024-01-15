import { expect, Locator, Page } from "@playwright/test";

import { Dialog } from "./Dialog";

export class UpdateScreenshotDialog extends Dialog {
  screenshot: Locator;
  screenshotPlaceholder: Locator;
  selectFileInput: Locator;

  constructor(page: Page) {
    super(page, {
      title: "Slice screenshots",
    });

    /**
     * Static locators
     */
    this.screenshot = this.dialog.getByRole("img", { name: "Preview image" });
    this.screenshotPlaceholder = this.dialog.getByText("Paste, drop or ...", {
      exact: true,
    });
    this.selectFileInput = this.dialog.getByText("Select file", {
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
  async updateScreenshot(fileName: string) {
    await expect(this.title).toBeVisible();
    const fileChooserPromise = this.page.waitForEvent("filechooser");
    await this.selectFileInput.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(`mocks/images/${fileName}.png`);
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
