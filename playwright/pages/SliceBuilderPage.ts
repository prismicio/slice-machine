import { expect, Locator, Page } from "@playwright/test";

import { AddVariationDialog } from "./components/AddVariationDialog";
import { RenameVariationDialog } from "./components/RenameVariationDialog";
import { DeleteVariationDialog } from "./components/DeleteVariationDialog";
import { BuilderPage } from "./shared/BuilderPage";
import { SlicesListPage } from "./SlicesListPage";
import {
  FieldTypeLabel,
  GroupFieldTemplateLabel,
} from "./components/AddFieldDropdown";
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
    this.addVariationButton = page.getByText("Add a variation", {
      exact: true,
    });
    this.noScreenshotMessage = page.getByText("No screenshot available", {
      exact: true,
    });
    // Repeatable zone
    this.repeatableZone = page.getByTestId("slice-repeatable-zone");
    this.repeatableZoneAddFieldButton = page.getByTestId("add-field-in-items");
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

  getListItem<TZoneType extends ZoneType>(
    fieldId: string,
    zoneType: TZoneType,
    groupFieldId?: TZoneType extends "static" ? string : never,
  ) {
    if (zoneType === "static") {
      if (groupFieldId) {
        return this.page
          .getByTestId("static-zone-content")
          .getByTestId(`list-item-group-${groupFieldId}-${fieldId}`);
      }

      return this.page
        .getByTestId("static-zone-content")
        .getByTestId(`list-item-${fieldId}`);
    }

    return this.page
      .getByTestId("slice-repeatable-zone")
      .getByTestId(`list-item-${fieldId}`);
  }

  getListItemFieldName<TZoneType extends ZoneType>(
    fieldId: string,
    fieldName: string,
    zoneType: TZoneType,
    groupFieldId?: TZoneType extends "static" ? string : never,
  ) {
    return this.getListItem(fieldId, zoneType, groupFieldId)
      .getByTestId("field-name")
      .getByText(fieldName, { exact: true });
  }

  getEditFieldButton<TZoneType extends ZoneType>(
    fieldId: string,
    zoneType: TZoneType,
    groupFieldId?: TZoneType extends "static" ? string : never,
  ) {
    return this.getListItem(fieldId, zoneType, groupFieldId).getByRole(
      "button",
      {
        name: "Edit field",
        exact: true,
      },
    );
  }

  getFieldMenuButton<TZoneType extends ZoneType>(
    fieldId: string,
    zoneType: TZoneType,
    groupFieldId?: TZoneType extends "static" ? string : never,
  ) {
    return this.getListItem(fieldId, zoneType, groupFieldId).getByTestId(
      "field-menu-button",
    );
  }

  getListItemFieldId<TZoneType extends ZoneType>(
    fieldId: string,
    zoneType: TZoneType,
    groupFieldId?: TZoneType extends "static" ? string : never,
  ) {
    let fieldSubId;
    if (zoneType === "static") {
      fieldSubId = "primary";
    } else {
      fieldSubId = "items[i]";
    }

    if (groupFieldId) {
      return this.getListItem(fieldId, zoneType, groupFieldId)
        .getByTestId("field-id")
        .getByText(`item.${fieldId}`, { exact: true });
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

  async addField<TZoneType extends ZoneType>(args: {
    type: FieldTypeLabel | GroupFieldTemplateLabel;
    name: string;
    expectedId: string;
    zoneType: TZoneType;
    groupFieldId?: TZoneType extends "static" ? string : never;
    grandparentGroupFieldId?: TZoneType extends "static" ? string : never;
  }) {
    const {
      type,
      name,
      expectedId,
      zoneType,
      groupFieldId,
      grandparentGroupFieldId,
    } = args;

    if (zoneType === "static") {
      if (groupFieldId && grandparentGroupFieldId) {
        await this.getListItem(groupFieldId, zoneType, grandparentGroupFieldId)
          .getByRole("button", { name: "Add a field", exact: true })
          .click();
      } else if (groupFieldId) {
        await this.getListItem(groupFieldId, zoneType)
          .getByRole("button", { name: "Add a field", exact: true })
          .click();
      } else {
        await this.staticZoneAddFieldButton.click();
      }
    } else {
      await this.repeatableZoneAddFieldButton.click();
    }

    await expect(this.addFieldDropdown.menu).toBeVisible();
    await this.addFieldDropdown.selectField(type);
    await this.newFieldNameInput.fill(name);
    await expect(this.newFieldIdInput).toHaveValue(expectedId);
    await this.newFieldAddButton.click();
  }

  async deleteField<TZoneType extends ZoneType>(
    fieldId: string,
    zoneType: TZoneType,
    groupFieldId?: TZoneType extends "static" ? string : never,
  ) {
    await this.getFieldMenuButton(fieldId, zoneType, groupFieldId).click();
    await this.page.getByRole("menuitem", { name: "Delete field" }).click();
  }

  async copyCodeSnippet<TZoneType extends ZoneType>(
    fieldId: string,
    zoneType: TZoneType,
    groupFieldId?: TZoneType extends "static" ? string : never,
  ) {
    await this.getListItem(fieldId, zoneType, groupFieldId)
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
      this.getListItem(fieldId, zoneType, groupFieldId).getByRole("button", {
        name: "Code snippet copied",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      this.getListItem(fieldId, zoneType, groupFieldId).getByRole("button", {
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
