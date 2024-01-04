import { Locator, Page } from "@playwright/test";

import { PageSnippetDialog } from "./components/PageSnippetDialog";
import { TypeBuilderPage } from "./shared/TypeBuilderPage";

export class PageTypeBuilderPage extends TypeBuilderPage {
  readonly pageSnippetDialog: PageSnippetDialog;
  readonly pageSnippetButton: Locator;

  constructor(page: Page) {
    super(page, {
      format: "page",
    });

    /**
     * Components
     */
    this.pageSnippetDialog = new PageSnippetDialog(page);

    /**
     * Static locators
     */
    this.pageSnippetButton = this.page.getByRole("button", {
      name: "Page snippet",
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
  // Handle actions here

  /**
   * Assertions
   */
  // Handle assertions here
}
