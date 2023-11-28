import { Locator, Page } from "@playwright/test";

import { CreateTypeModal } from "../components/CreateTypeModal";
import { RenameTypeModal } from "../components/RenameTypeModal";
import { BasePage } from "../components/BasePage";

export class TypesTablePage extends BasePage {
  readonly createTypeModal: CreateTypeModal;
  readonly renameTypeModal: RenameTypeModal;
  readonly path: string;
  readonly breadcrumbLabel: Locator;
  readonly createButton: Locator;
  readonly actionIcon: Locator;

  protected constructor(
    page: Page,
    format: "page" | "custom",
    breadcrumbLabel: string,
    path: string,
  ) {
    super(page);

    /**
     * Components
     */
    this.createTypeModal = new CreateTypeModal(page, format);
    this.renameTypeModal = new RenameTypeModal(page, format);

    /**
     * Static locators
     */
    this.path = path;
    this.breadcrumbLabel = this.breadcrumb.getByText(breadcrumbLabel);
    this.createButton = page
      .getByTestId("create-ct")
      .or(
        page
          .getByRole("article")
          .getByRole("button", { name: "Create", exact: true }),
      );
    this.actionIcon = page.getByTestId("ct-action-icon");
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
    await this.breadcrumbLabel.isVisible();
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
