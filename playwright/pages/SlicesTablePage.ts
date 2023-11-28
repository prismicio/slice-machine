import { Locator, Page } from "@playwright/test";

import { CreateSliceModal } from "./components/CreateSliceModal";
import { RenameSliceModal } from "./components/RenameSliceModal";
import { DeleteSliceModal } from "./components/DeleteSliceModal";
import { BasePage } from "./components/BasePage";

export class SlicesTablePage extends BasePage {
  readonly createSliceModal: CreateSliceModal;
  readonly renameSliceModal: RenameSliceModal;
  readonly deleteSliceModal: DeleteSliceModal;
  readonly path: string;
  readonly header: Locator;
  readonly breadcrumbLabel: Locator;
  readonly createButton: Locator;

  constructor(page: Page) {
    super(page);

    /**
     * Components
     */
    this.createSliceModal = new CreateSliceModal(page);
    this.renameSliceModal = new RenameSliceModal(page);
    this.deleteSliceModal = new DeleteSliceModal(page);

    /**
     * Static locators
     */
    this.path = "/slices";
    this.header = page.getByRole("banner");
    this.breadcrumbLabel = this.breadcrumb.getByText("Slices");
    this.createButton = this.header
      .getByRole("button", { name: "Create one", exact: true })
      .or(page.getByRole("button", { name: "Create", exact: true }));
  }

  /**
   * Dynamic locators
   */
  getCard(name: string, variation = "Default"): Locator {
    return this.page.getByRole("link", {
      name: `${name} ${variation} slice card`,
      exact: true,
    });
  }

  /**
   * Actions
   */
  async goto() {
    await this.page.goto(this.path);
    await this.breadcrumbLabel.isVisible();
  }

  async clickCard(name: string) {
    // Click on slice name to make sure not to accidentally click
    // on a button that would trigger another action
    await this.getCard(name).getByText(name).click();
  }

  async openCreateModal() {
    await this.createButton.first().click();
  }

  async openActionModal(name: string, action: "Rename" | "Delete") {
    await this.getCard(name).getByTestId("slice-action-icon").click();
    await this.page
      .getByTestId("slice-action-icon-dropdown")
      .getByText(action)
      .click();
  }

  async openScreenshotModal(name: string) {
    await this.getCard(name)
      .getByRole("button", {
        name: "Update Screenshot",
        exact: true,
      })
      .click();
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
