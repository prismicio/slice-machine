import { Locator, Page } from "@playwright/test";

import { CreateSliceDialog } from "./components/CreateSliceDialog";
import { RenameSliceDialog } from "./components/RenameSliceDialog";
import { DeleteSliceDialog } from "./components/DeleteSliceDialog";
import { SliceMachinePage } from "./SliceMachinePage";

export class SlicesListPage extends SliceMachinePage {
  readonly createSliceDialog: CreateSliceDialog;
  readonly renameSliceDialog: RenameSliceDialog;
  readonly deleteSliceDialog: DeleteSliceDialog;
  readonly path: string;
  readonly header: Locator;
  readonly breadcrumbLabel: Locator;
  readonly createButton: Locator;

  constructor(page: Page) {
    super(page);

    /**
     * Components
     */
    this.createSliceDialog = new CreateSliceDialog(page);
    this.renameSliceDialog = new RenameSliceDialog(page);
    this.deleteSliceDialog = new DeleteSliceDialog(page);

    /**
     * Static locators
     */
    this.path = "/slices";
    this.header = page.getByRole("banner");
    this.breadcrumbLabel = this.breadcrumb.getByText("Slices", { exact: true });
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
    await this.getCard(name).getByText(name, { exact: true }).click();
  }

  async openCreateDialog() {
    await this.createButton.first().click();
  }

  async openActionMenu(name: string, action: "Rename" | "Delete") {
    await this.getCard(name)
      .getByRole("button", { name: "slice action icon", exact: true })
      .click();
    await this.page
      .getByTestId("slice-action-icon-dropdown")
      .getByText(action, { exact: true })
      .click();
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
