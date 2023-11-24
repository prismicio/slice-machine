import { Locator, Page } from "@playwright/test";

import { CreateSliceModal } from "./components/CreateSliceModal";
import { RenameSliceModal } from "./components/RenameSliceModal";
import { DeleteSliceModal } from "./components/DeleteSliceModal";
import { Menu } from "./components/Menu";

export class SlicesTablePage {
  readonly page: Page;
  readonly menu: Menu;
  readonly createSliceModal: CreateSliceModal;
  readonly renameSliceModal: RenameSliceModal;
  readonly deleteSliceModal: DeleteSliceModal;

  readonly path: string;
  readonly body: Locator;
  readonly header: Locator;
  readonly title: Locator;
  readonly createButton: Locator;

  constructor(page: Page) {
    /**
     * Components
     */
    this.page = page;
    this.menu = new Menu(page);
    this.createSliceModal = new CreateSliceModal(page);
    this.renameSliceModal = new RenameSliceModal(page);
    this.deleteSliceModal = new DeleteSliceModal(page);

    /**
     * Static locators
     */
    this.path = "/slices";
    this.body = page.getByRole("main").first();
    this.header = page.getByRole("banner");
    this.title = this.header.getByLabel("Breadcrumb").getByText("Slices");
    this.createButton = this.header
      .getByRole("button", { name: "Create one", exact: true })
      .or(page.getByRole("button", { name: "Create", exact: true }));
  }

  /**
   * Dynamic locators
   */
  getCard(name: string, variation = "Default"): Locator {
    return this.body.getByRole("link", {
      name: `${name} ${variation} slice card`,
      exact: true,
    });
  }

  /**
   * Actions
   */
  async goto() {
    await this.page.goto(this.path);
    await this.title.isVisible();
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
    await this.getCard(name).getByRole("button", {
      name: "Update Screenshot",
      exact: true,
    });
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
