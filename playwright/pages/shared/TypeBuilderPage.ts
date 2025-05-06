import { expect, Locator, Page } from "@playwright/test";

import { CreateTypeDialog } from "../components/CreateTypeDialog";
import { RenameTypeDialog } from "../components/RenameTypeDialog";
import { DeleteTypeDialog } from "../components/DeleteTypeDialog";
import { UseTemplateSlicesDialog } from "../components/UseTemplateSlicesDialog";
import { SelectExistingSlicesDialog } from "../components/SelectExistingSlicesDialog";
import { AddTabDialog } from "../components/AddTabDialog";
import { RenameTabDialog } from "../components/RenameTabDialog";
import { DeleteTabDialog } from "../components/DeleteTabDialog";
import { CreateSliceDialog } from "../components/CreateSliceDialog";
import { DeleteSliceZoneDialog } from "../components/DeleteSliceZoneDialog";
import { CustomTypesTablePage } from "../CustomTypesTablePage";
import { PageTypesTablePage } from "../PageTypesTablePage";
import { BuilderPage } from "./BuilderPage";
import { FieldTypeLabel } from "../components/AddFieldDropdown";
import { UIDEditor } from "../components/UIDEditor";

export class TypeBuilderPage extends BuilderPage {
  readonly createTypeDialog: CreateTypeDialog;
  readonly renameTypeDialog: RenameTypeDialog;
  readonly deleteTypeDialog: DeleteTypeDialog;
  readonly useTemplateSlicesDialog: UseTemplateSlicesDialog;
  readonly selectExistingSlicesDialog: SelectExistingSlicesDialog;
  readonly createSliceDialog: CreateSliceDialog;
  readonly addTabDialog: AddTabDialog;
  readonly renameTabDialog: RenameTabDialog;
  readonly deleteTabDialog: DeleteTabDialog;
  readonly customTypeTablePage: CustomTypesTablePage;
  readonly pageTypeTablePage: PageTypesTablePage;
  readonly deleteSliceZoneDialog: DeleteSliceZoneDialog;
  readonly uidEditor: UIDEditor;
  readonly format: "page" | "custom";
  readonly tab: Locator;
  readonly tabList: Locator;
  readonly addTabButton: Locator;
  readonly renameTabButton: Locator;
  readonly deleteTabButton: Locator;
  readonly sliceZoneSwitch: Locator;
  readonly sliceZoneBlankSlate: Locator;
  readonly sliceZoneBlankSlateTitle: Locator;
  readonly sliceZoneSharedSliceCard: Locator;
  readonly sliceZoneBlankSlateUseTemplateAction: Locator;
  readonly sliceZoneBlankSlateSelectExistingAction: Locator;
  readonly sliceZoneBlankSlateCreateNewAction: Locator;
  readonly sliceZoneAddDropdown: Locator;
  readonly sliceZoneAddDropdownUseTemplateAction: Locator;
  readonly sliceZoneAddDropdownSelectExistingAction: Locator;
  readonly sliceZoneAddDropdownCreateNewAction: Locator;
  readonly removeSliceButton: Locator;
  readonly staticZoneInfoDialogConfirmCta: Locator;

  constructor(
    page: Page,
    options: {
      format: "page" | "custom";
    },
  ) {
    super(page);
    const { format } = options;

    /**
     * Components
     */
    this.createTypeDialog = new CreateTypeDialog(page, format);
    this.renameTypeDialog = new RenameTypeDialog(page, format);
    this.deleteTypeDialog = new DeleteTypeDialog(page, format);
    this.useTemplateSlicesDialog = new UseTemplateSlicesDialog(page);
    this.selectExistingSlicesDialog = new SelectExistingSlicesDialog(page);
    this.createSliceDialog = new CreateSliceDialog(page);
    this.customTypeTablePage = new CustomTypesTablePage(page);
    this.pageTypeTablePage = new PageTypesTablePage(page);
    this.addTabDialog = new AddTabDialog(page);
    this.renameTabDialog = new RenameTabDialog(page);
    this.deleteTabDialog = new DeleteTabDialog(page);
    this.deleteSliceZoneDialog = new DeleteSliceZoneDialog(page);
    this.uidEditor = new UIDEditor(page);

    /**
     * Static locators
     */
    // Global
    this.format = format;
    // Tabs
    this.tabList = page.getByRole("tablist");
    this.tab = this.tabList.getByRole("tab");
    this.addTabButton = this.tabList.getByRole("button", {
      name: "Add new tab",
      exact: true,
    });
    this.renameTabButton = page
      .getByRole("menu")
      .getByText("Rename", { exact: true });
    this.deleteTabButton = page
      .getByRole("menu")
      .getByText("Remove", { exact: true });
    // Slice zone
    this.sliceZoneSwitch = page.getByTestId("slice-zone-switch");
    this.sliceZoneBlankSlate = page.getByTestId("slice-zone-blank-slate");
    this.sliceZoneBlankSlateTitle = this.sliceZoneBlankSlate.getByText(
      "Add slices",
      {
        exact: true,
      },
    );
    this.sliceZoneSharedSliceCard = page.getByTestId("shared-slice-card");
    this.sliceZoneBlankSlateUseTemplateAction =
      this.sliceZoneBlankSlate.getByText("Use a template", {
        exact: true,
      });
    this.sliceZoneBlankSlateSelectExistingAction =
      this.sliceZoneBlankSlate.getByText("Reuse an existing slice", {
        exact: true,
      });
    this.sliceZoneBlankSlateCreateNewAction =
      this.sliceZoneBlankSlate.getByText("Start from scratch", {
        exact: true,
      });
    this.sliceZoneAddDropdown = page.getByTestId("add-new-slice-dropdown");
    this.sliceZoneAddDropdownUseTemplateAction = page
      .getByRole("menu")
      .getByText("Use a template", { exact: true });
    this.sliceZoneAddDropdownSelectExistingAction = page
      .getByRole("menu")
      .getByText("Reuse an existing slice", { exact: true });
    this.sliceZoneAddDropdownCreateNewAction = page
      .getByRole("menu")
      .getByText("Start from scratch", { exact: true });
    this.removeSliceButton = page.getByRole("button", {
      name: "Remove slice",
      exact: true,
    });
    this.staticZoneInfoDialogConfirmCta = page.getByRole("button", {
      name: "Got it",
      exact: true,
    });
  }

  /**
   * Dynamic locators
   */
  getTab(name: string) {
    return this.tabList.getByRole("tab", { name, exact: true });
  }

  getSliceZoneSharedSliceCard(name: string) {
    return this.sliceZoneSharedSliceCard.getByText(name, { exact: false });
  }

  getTabMenuButton(name: string) {
    return this.getTab(name).getByRole("button", {
      name: `tab-${name}-menu-button`,
      exact: true,
    });
  }

  getListItem(fieldId: string, groupFieldId?: string) {
    if (groupFieldId) {
      return this.page.getByTestId(
        `list-item-group-${groupFieldId}-${fieldId}`,
      );
    }

    return this.page.getByTestId(`list-item-${fieldId}`);
  }

  getListItemFieldName(
    fieldId: string,
    fieldName: string,
    groupFieldId?: string,
  ) {
    return this.getListItem(fieldId, groupFieldId)
      .getByTestId("field-name")
      .getByText(fieldName, { exact: true });
  }

  getEditFieldButton(fieldId: string, groupFieldId?: string) {
    return this.getListItem(fieldId, groupFieldId).getByRole("button", {
      name: "Edit field",
      exact: true,
    });
  }

  getFieldMenuButton(fieldId: string, groupFieldId?: string) {
    return this.getListItem(fieldId, groupFieldId).getByTestId(
      "field-menu-button",
    );
  }

  getListItemFieldId(fieldId: string, groupFieldId?: string) {
    if (groupFieldId) {
      return this.getListItem(fieldId, groupFieldId)
        .getByTestId("field-id")
        .getByText(`item.${fieldId}`, { exact: true });
    }

    return this.getListItem(fieldId)
      .getByTestId("field-id")
      .getByText(`data.${fieldId}`, { exact: true });
  }

  /**
   * Actions
   */
  async goto(name: string) {
    const typePage =
      this.format === "page"
        ? this.pageTypeTablePage
        : this.customTypeTablePage;
    await typePage.goto();
    await expect(typePage.getRow(name)).toBeVisible();
    await typePage.getRow(name).click();
    await this.checkBreadcrumb(name);
  }

  async openTab(name: string) {
    await expect(this.getTab(name)).toBeVisible();
    await this.getTab(name).click();
    await this.checkIfTabIsActive(name);
  }

  async openActionMenu(action: "Rename" | "Remove") {
    await this.page
      .getByRole("button", { name: "Custom type actions", exact: true })
      .click();
    await this.page
      .getByRole("menuitem", { name: action, exact: true })
      .click();
  }

  async addStaticField(args: {
    type: FieldTypeLabel;
    name: string;
    expectedId: string;
    groupFieldId?: string;
    grandparentGroupFieldId?: string;
  }) {
    const { type, name, expectedId, groupFieldId, grandparentGroupFieldId } =
      args;

    if (groupFieldId) {
      await this.getListItem(groupFieldId, grandparentGroupFieldId)
        .getByTestId("add-field")
        .click();
    } else {
      await this.staticZoneAddFieldButton.click();
    }

    await expect(this.addFieldDropdown.menu).toBeVisible();
    await this.addFieldDropdown.selectField(type);
    await this.newFieldNameInput.fill(name);
    await expect(this.newFieldIdInput).toHaveValue(expectedId);
    await this.newFieldAddButton.click();
  }

  async deleteField(fieldId: string, groupFieldId?: string) {
    await this.getFieldMenuButton(fieldId, groupFieldId).click();
    await this.page.getByRole("menuitem", { name: "Delete field" }).click();
  }

  async copyCodeSnippet(fieldId: string, groupFieldId?: string) {
    await this.getListItem(fieldId, groupFieldId)
      .getByRole("button", {
        name: "Copy code snippet",
        exact: true,
      })
      .first()
      .click();

    const handle = await this.page.evaluateHandle(() =>
      navigator.clipboard.readText(),
    );
    const clipboardContent = await handle.jsonValue();
    expect(clipboardContent).toContain(fieldId);

    await expect(
      this.getListItem(fieldId, groupFieldId).getByRole("button", {
        name: "Code snippet copied",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      this.getListItem(fieldId, groupFieldId).getByRole("button", {
        name: "Copy code snippet",
        exact: true,
      }),
    ).toBeVisible();
  }

  /**
   *  Assertions
   */
  async checkIfTabIsActive(name: string) {
    await expect(this.getTab(name)).toHaveAttribute("aria-selected", "true");
  }

  async checkBreadcrumb(name: string) {
    await this.checkBreadcrumbItems([
      this.format === "page" ? "Page types" : "Custom types",
      name,
    ]);
  }
}
