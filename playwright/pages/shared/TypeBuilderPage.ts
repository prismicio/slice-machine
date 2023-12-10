import { expect, Locator, Page } from "@playwright/test";

import { CreateTypeDialog } from "../components/CreateTypeDialog";
import { RenameTypeDialog } from "../components/RenameTypeDialog";
import { UseTemplateSlicesDialog } from "../components/UseTemplateSlicesDialog";
import { CustomTypesTablePage } from "../CustomTypesTablePage";
import { BuilderPage } from "./BuilderPage";
import { PageTypesTablePage } from "../PageTypesTablePage";

export class TypeBuilderPage extends BuilderPage {
  readonly createTypeDialog: CreateTypeDialog;
  readonly renameTypeDialog: RenameTypeDialog;
  readonly useTemplateSlicesDialog: UseTemplateSlicesDialog;
  readonly customTypeTablePage: CustomTypesTablePage;
  readonly pageTypeTablePage: PageTypesTablePage;
  readonly format: "page" | "custom";
  readonly savedMessage: Locator;
  readonly tab: Locator;
  readonly tabList: Locator;
  readonly staticZone: Locator;
  readonly staticZonePlaceholder: Locator;
  readonly staticZoneListItem: Locator;
  readonly sliceZoneSwitch: Locator;
  readonly sliceZoneBlankSlate: Locator;
  readonly sliceZoneBlankSlateTitle: Locator;
  readonly sliceZoneUseTemplateAction: Locator;
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
    this.customTypeTablePage = new CustomTypesTablePage(page);
    this.pageTypeTablePage = new PageTypesTablePage(page);

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

  /**
   *  Assertions
   */
  async checkSavedMessage() {
    await expect(this.savedMessage).toBeVisible();
    await expect(this.savedMessage).not.toBeVisible();
  }
}
