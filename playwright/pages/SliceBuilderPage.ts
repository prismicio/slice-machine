import { expect, Locator, Page } from "@playwright/test";

import { AddVariationDialog } from "./components/AddVariationDialog";
import { RenameVariationDialog } from "./components/RenameVariationDialog";
import { DeleteVariationDialog } from "./components/DeleteVariationDialog";
import { BuilderPage } from "./shared/BuilderPage";
import { SlicesListPage } from "./SlicesListPage";
import { FieldTypeLabel } from "./components/AddFieldDialog";
import { UpdateScreenshotDialog } from "./components/UpdateScreenshotDialog";
import { DeleteRepeatableZoneDialog } from "./components/DeleteRepeatableZoneDialog";

type ZoneType = "static" | "repeatable";

export class SliceBuilderPage extends BuilderPage {
  readonly slicesListPage: SlicesListPage;
  readonly addVariationDialog: AddVariationDialog;
  readonly renameVariationDialog: RenameVariationDialog;
  readonly deleteVariationDialog: DeleteVariationDialog;
  readonly updateScreenshotDialog: UpdateScreenshotDialog;
  readonly deleteRepeatableZoneDialog: DeleteRepeatableZoneDialog;
  readonly simulateButton: Locator;
  readonly simulateTooltipTitle: Locator;
  readonly simulateTooltipCloseButton: Locator;
  readonly variationCards: Locator;
  readonly addVariationButton: Locator;
  readonly noScreenshotMessage: Locator;
  readonly repeatableZone: Locator;
  readonly repeatableZoneAddFieldButton: Locator;
  readonly repeatableZonePlaceholder: Locator;
  readonly repeatableZoneListItem: Locator;

  constructor(page: Page) {
    super(page);

    /**
     * Components
     */
    this.slicesListPage = new SlicesListPage(page);
    this.addVariationDialog = new AddVariationDialog(page);
    this.renameVariationDialog = new RenameVariationDialog(page);
    this.deleteVariationDialog = new DeleteVariationDialog(page);
    this.updateScreenshotDialog = new UpdateScreenshotDialog(page);
    this.deleteRepeatableZoneDialog = new DeleteRepeatableZoneDialog(page);

    /**
     * Static locators
     */
    // Global
    this.simulateButton = page.getByText("Simulate", { exact: true });
    this.simulateTooltipTitle = page.getByText("Simulate your slices");
    this.simulateTooltipCloseButton = page.getByText("Got it");
    // Variations
    this.variationCards = page.getByRole("link", {
      name: "slice card",
      exact: false,
    });
    this.addVariationButton = page.getByText("Add a new variation", {
      exact: true,
    });
    this.noScreenshotMessage = page.getByText("No screenshot available", {
      exact: true,
    });
    // Repeatable zone
    this.repeatableZone = page.getByTestId("slice-repeatable-zone");
    this.repeatableZoneAddFieldButton = page.getByTestId(
      "add-Repeatable-field",
    );
    this.repeatableZonePlaceholder = page.getByText(
      "Add a field to your Repeatable Zone",
      { exact: true },
    );
    this.repeatableZoneListItem = this.repeatableZone.getByRole("listitem");
  }

  /**
   * Dynamic locators
   */
  getVariationCard(name: string, variation: string): Locator {
    return this.page.getByRole("link", {
      name: `${name} ${variation} slice card`,
      exact: true,
    });
  }

  getListItem(fieldId: string, zoneType: ZoneType) {
    if (zoneType === "static") {
      return this.page
        .getByTestId("static-zone-content")
        .getByTestId(`list-item-${fieldId}`);
    }

    return this.page
      .getByTestId("slice-repeatable-zone")
      .getByTestId(`list-item-${fieldId}`);
  }

  getListItemFieldName(fieldId: string, fieldName: string, zoneType: ZoneType) {
    return this.getListItem(fieldId, zoneType)
      .getByTestId("field-name")
      .getByText(fieldName, { exact: true });
  }

  getEditFieldButton(fieldId: string, zoneType: ZoneType) {
    return this.getListItem(fieldId, zoneType).getByRole("button", {
      name: "Edit field",
      exact: true,
    });
  }

  getFieldMenuButton(fieldId: string, zoneType: ZoneType) {
    return this.getListItem(fieldId, zoneType).getByTestId("field-menu-button");
  }

  getListItemFieldId(fieldId: string, zoneType: ZoneType) {
    let fieldSubId;

    if (zoneType === "static") {
      fieldSubId = "primary";
    } else {
      fieldSubId = "items[i]";
    }

    return this.getListItem(fieldId, zoneType)
      .getByTestId("field-id")
      .getByText(`slice.${fieldSubId}.${fieldId}`, { exact: true });
  }

  /**
   * Actions
   */
  async goto(sliceName: string) {
    await this.slicesListPage.goto();
    await this.slicesListPage.page
      .getByText(sliceName, { exact: true })
      .click();
    await this.checkBreadcrumb(sliceName);
  }

  async openVariationActionMenu(
    name: string,
    variation: string,
    action: "Rename" | "Delete" | "Update screenshot",
  ) {
    await this.getVariationCard(name, variation)
      .getByRole("button", { name: "Slice actions", exact: true })
      .click();
    await this.page
      .getByTestId("slice-action-icon-dropdown")
      .getByText(action, { exact: true })
      .click();
  }

  async openAddVariationDialog() {
    await this.addVariationButton.click();
  }

  async addField(args: {
    type: FieldTypeLabel;
    name: string;
    expectedId: string;
    zoneType: ZoneType;
  }) {
    const { type, name, expectedId, zoneType } = args;

    if (zoneType === "static") {
      await this.staticZoneAddFieldButton.click();
    } else {
      await this.repeatableZoneAddFieldButton.click();
    }

    await expect(this.addFieldDialog.title).toBeVisible();
    await this.addFieldDialog.selectField(type);
    await this.newFieldNameInput.fill(name);
    await expect(this.newFieldIdInput).toHaveValue(expectedId);
    await this.newFieldAddButton.click();
    await expect(this.addFieldDialog.title).not.toBeVisible();
  }

  async deleteField(
    fieldId: string,
    zoneType: ZoneType,
    options: { isLastField?: boolean } = {},
  ) {
    await this.getFieldMenuButton(fieldId, zoneType).click();
    await this.page.getByRole("menuitem", { name: "Delete field" }).click();

    if (zoneType === "repeatable" && options.isLastField) {
      await this.deleteRepeatableZoneDialog.deleteRepeatableZone();
    }
  }

  async copyCodeSnippet(fieldId: string, zoneType: ZoneType) {
    await this.getListItem(fieldId, zoneType)
      .getByRole("button", {
        name: "Copy code snippet",
        exact: true,
      })
      .click();

    const handle = await this.page.evaluateHandle(() =>
      navigator.clipboard.readText(),
    );
    const clipboardContent = await handle.jsonValue();
    expect(clipboardContent).toContain(fieldId);

    await expect(
      this.getListItem(fieldId, zoneType).getByRole("button", {
        name: "Code snippet copied",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      this.getListItem(fieldId, zoneType).getByRole("button", {
        name: "Copy code snippet",
        exact: true,
      }),
    ).toBeVisible();
  }

  /**
   * Assertions
   */
  async checkBreadcrumb(sliceName: string) {
    await this.checkBreadcrumbItems(["Slices", sliceName]);
  }
}
