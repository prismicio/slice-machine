import { expect, Locator, Page } from "@playwright/test";

import { CreateTypeDialog } from "../components/CreateTypeDialog";
import { RenameTypeDialog } from "../components/RenameTypeDialog";
import { DeleteTypeDialog } from "../components/DeleteTypeDialog";
import { SliceMachinePage } from "../SliceMachinePage";

export class TypesTablePage extends SliceMachinePage {
  readonly createTypeDialog: CreateTypeDialog;
  readonly renameTypeDialog: RenameTypeDialog;
  readonly deleteTypeDialog: DeleteTypeDialog;
  readonly path: string;
  readonly breadcrumbLabel: Locator;
  readonly createButton: Locator;
  readonly actionIcon: Locator;
  readonly blankSlate: Locator;
  readonly blankSlateCreateAction: Locator;

  protected constructor(
    page: Page,
    options: {
      format: "page" | "custom";
      breadcrumbLabel: string;
      path: string;
    },
  ) {
    super(page);
    const { format, breadcrumbLabel, path } = options;

    /**
     * Components
     */
    this.createTypeDialog = new CreateTypeDialog(page, format);
    this.renameTypeDialog = new RenameTypeDialog(page, format);
    this.deleteTypeDialog = new DeleteTypeDialog(page, format);

    /**
     * Static locators
     */
    this.path = path;
    this.breadcrumbLabel = this.breadcrumb.getByText(breadcrumbLabel, {
      exact: true,
    });
    this.createButton = page
      .getByTestId("create-ct")
      .or(
        page
          .getByRole("article")
          .getByRole("button", { name: "Create", exact: true }),
      );
    this.actionIcon = page.getByTestId("ct-action-icon");
    this.blankSlate = page.getByTestId("blank-slate");
    this.blankSlateCreateAction = this.blankSlate.getByRole("button", {
      name: "Create",
      exact: true,
    });
  }

  /**
   * Dynamic locators
   */
  getRow(name: string): Locator {
    return this.page.getByRole("row", {
      name,
      exact: false,
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

  async openCreateDialog() {
    await this.createButton.first().click();
  }

  async openActionMenu(name: string, action: "Rename" | "Remove") {
    await this.getRow(name)
      .getByRole("button", { name: "Custom type actions", exact: true })
      .click();
    await this.page
      .getByRole("menuitem", { name: action, exact: true })
      .click();
  }

  /**
   * Assertions
   */
  async checkBlankSlateContainsText(text: string) {
    await expect(this.blankSlate).toContainText(text);
  }
}
