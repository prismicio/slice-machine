import { expect, Locator, Page } from "@playwright/test";

import { CreateTypeDialog } from "../components/CreateTypeDialog";
import { RenameTypeDialog } from "../components/RenameTypeDialog";
import { UseTemplateSlicesDialog } from "../components/UseTemplateSlicesDialog";
import { SelectExistingSlicesDialog } from "../components/SelectExistingSlicesDialog";
import { AddTabDialog } from "../components/AddTabDialog";
import { CustomTypesTablePage } from "../CustomTypesTablePage";
import { PageTypesTablePage } from "../PageTypesTablePage";
import { BuilderPage } from "./BuilderPage";

export class TypeBuilderPage extends BuilderPage {
  readonly createTypeDialog: CreateTypeDialog;
  readonly renameTypeDialog: RenameTypeDialog;
  readonly useTemplateSlicesDialog: UseTemplateSlicesDialog;
  readonly selectExistingSlicesDialog: SelectExistingSlicesDialog;
  readonly addTabDialog: AddTabDialog;
  readonly customTypeTablePage: CustomTypesTablePage;
  readonly pageTypeTablePage: PageTypesTablePage;
  readonly format: "page" | "custom";
  readonly savedMessage: Locator;
  readonly tab: Locator;
  readonly tabList: Locator;
  readonly addTabButton: Locator;
  readonly staticZone: Locator;
  readonly staticZonePlaceholder: Locator;
  readonly staticZoneListItem: Locator;
  readonly sliceZoneSwitch: Locator;
  readonly sliceZoneBlankSlate: Locator;
  readonly sliceZoneBlankSlateTitle: Locator;
  readonly sliceZoneUseTemplateAction: Locator;
  readonly sliceZoneSelectExistingAction: Locator;
  readonly sliceZoneSharedSliceCard: Locator;

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
    this.useTemplateSlicesDialog = new UseTemplateSlicesDialog(page);
    this.selectExistingSlicesDialog = new SelectExistingSlicesDialog(page);
    this.customTypeTablePage = new CustomTypesTablePage(page);
    this.pageTypeTablePage = new PageTypesTablePage(page);
    this.addTabDialog = new AddTabDialog(page);

    /**
     * Static locators
     */
    // Global
    this.format = format;
    this.savedMessage = page.getByText(
      `${format.charAt(0).toUpperCase()}${format.slice(
        1,
      )} type saved successfully`,
      { exact: true },
    );
    // Tabs
    this.tabList = page.getByRole("tablist");
    this.tab = this.tabList.getByRole("tab");
    this.addTabButton = this.tabList.getByRole("button", {
      name: "Add new tab",
      exact: true,
    });
    // Static zone
    this.staticZone = page.getByTestId("ct-static-zone");
    this.staticZonePlaceholder = this.staticZone.getByText(
      "Add a field to your Static Zone",
      { exact: true },
    );
    this.staticZoneListItem = this.staticZone.getByRole("listitem");
    // Slice zone
    this.sliceZoneSwitch = page.getByTestId("slice-zone-switch");
    this.sliceZoneBlankSlate = page.getByTestId("slice-zone-blank-slate");
    this.sliceZoneBlankSlateTitle = this.sliceZoneBlankSlate.getByText(
      "Add slices",
      {
        exact: true,
      },
    );
    this.sliceZoneUseTemplateAction = page.getByText("Use template", {
      exact: true,
    });
    this.sliceZoneSelectExistingAction = page.getByText("Select existing", {
      exact: true,
    });
    this.sliceZoneSharedSliceCard = page.getByTestId("shared-slice-card");
  }

  /**
   * Dynamic locators
   */
  getStaticZoneListItemFieldName(name: string) {
    return this.staticZoneListItem
      .getByTestId("field-name")
      .getByText(name, { exact: true });
  }

  getStaticZoneListItemFieldId(name: string) {
    return this.staticZoneListItem
      .getByTestId("field-id")
      .getByText(name, { exact: true });
  }

  getTab(name: string) {
    return this.tabList.getByRole("tab", { name, exact: true });
  }

  getSliceZoneSharedSliceCard(name: string) {
    return this.sliceZoneSharedSliceCard.getByText(name, { exact: false });
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
  }

  async openTab(name: string) {
    await expect(this.getTab(name)).toBeVisible();
    await this.getTab(name).click();
    await this.checkIfTabIsActive(name);
  }

  /**
   *  Assertions
   */
  async checkSavedMessage() {
    await expect(this.savedMessage).toBeVisible();
    await expect(this.savedMessage).not.toBeVisible();
  }

  async checkIfTabIsActive(name: string) {
    await expect(this.getTab(name)).toHaveAttribute("aria-selected", "true");
  }
}
