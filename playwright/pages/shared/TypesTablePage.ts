import { Locator, Page } from "@playwright/test";

import { CreateTypeModal } from "../components/CreateTypeModal";
import { RenameTypeModal } from "../components/RenameTypeModal";
import { Menu } from "../components/Menu";

export class TypesTablePage {
  readonly page: Page;
  readonly menu: Menu;
  readonly createTypeModal: CreateTypeModal;
  readonly renameTypeModal: RenameTypeModal;

  readonly path: string;
  readonly body: Locator;
  readonly title: Locator;
  readonly createButton: Locator;
  readonly actionIcon: Locator;

  protected constructor(
    page: Page,
    format: "page" | "custom",
    title: string,
    path: string,
  ) {
    /**
     * Components
     */
    this.page = page;
    this.menu = new Menu(page);
    this.createTypeModal = new CreateTypeModal(page, format);
    this.renameTypeModal = new RenameTypeModal(page, format);

    /**
     * Static locators
     */
    this.path = path;
    this.body = page.getByRole("main");
    this.title = page.getByLabel("Breadcrumb").getByText(title);
    this.createButton = page
      .getByTestId("create-ct")
      .or(
        this.body
          .getByRole("article")
          .getByRole("button", { name: "Create", exact: true }),
      );
    this.actionIcon = this.body.getByTestId("ct-action-icon");
  }

  /**
   * Dynamic locators
   */
  getRow(name: string): Locator {
    return this.page.getByRole("row", {
      name,
    });
  }

  /**
   * Actions
   */
  async goto() {
    await this.page.goto(this.path);
    await this.title.isVisible();
  }

  async clickRow(name: string) {
    await this.getRow(name).getByRole("button", { name, exact: true }).click();
  }

  async openCreateModal() {
    await this.createButton.first().click();
  }

  async openActionModal(name: string, action: "Rename" | "Delete") {
    await this.getRow(name).locator('[data-testid="editDropdown"]').click();
    await this.page
      .getByRole("menuitem", { name: action, exact: true })
      .click();
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
