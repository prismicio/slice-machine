import { expect, Locator, Page } from "@playwright/test";

import { AddVariationDialog } from "./components/AddVariationDialog";
import { RenameVariationDialog } from "./components/RenameVariationDialog";
import { DeleteVariationDialog } from "./components/DeleteVariationDialog";
import { BuilderPage } from "./shared/BuilderPage";
import { SlicesListPage } from "./SlicesListPage";

export class SliceBuilderPage extends BuilderPage {
  readonly slicesListPage: SlicesListPage;
  readonly addVariationDialog: AddVariationDialog;
  readonly renameVariationDialog: RenameVariationDialog;
  readonly deleteVariationDialog: DeleteVariationDialog;
  readonly savedMessage: Locator;
  readonly simulateTooltipTitle: Locator;
  readonly simulateTooltipCloseButton: Locator;
  readonly variationCards: Locator;
  readonly addVariationButton: Locator;
  readonly staticZone: Locator;
  readonly staticZonePlaceholder: Locator;
  readonly staticZoneListItem: Locator;
  readonly repeatableZone: Locator;
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

    /**
     * Static locators
     */
    // Global
    this.savedMessage = page.getByText("Slice saved successfully", {
      exact: false,
    });
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
    // Static zone
    this.staticZone = page.getByTestId("slice-non-repeatable-zone");
    this.staticZonePlaceholder = page.getByText(
      "Add a field to your Static Zone",
      { exact: true },
    );
    this.staticZoneListItem = this.staticZone.getByRole("listitem");
    // Repeatable zone
    this.repeatableZone = page.getByTestId("slice-repeatable-zone");
    this.repeatableZonePlaceholder = page.getByText(
      "Add a field to your Repeatable Zone",
      { exact: true },
    );
    this.repeatableZoneListItem = this.repeatableZone.getByRole("listitem");
  }

  /**
   * Dynamic locators
   */
  override getBreadcrumbLabel(sliceName: string) {
    return this.breadcrumb.getByText(`Slices / ${sliceName}`, { exact: true });
  }

  getVariationCard(name: string, variation: string): Locator {
    return this.page.getByRole("link", {
      name: `${name} ${variation} slice card`,
      exact: true,
    });
  }

  /**
   * Actions
   */
  async goto(sliceName: string) {
    await this.slicesListPage.goto();
    await this.slicesListPage.page
      .getByText(sliceName, { exact: true })
      .click();
    await expect(this.getBreadcrumbLabel(sliceName)).toBeVisible();
  }

  async openVariationActionMenu(
    name: string,
    variation: string,
    action: "Rename" | "Delete",
  ) {
    await this.getVariationCard(name, variation)
      .getByTestId("slice-action-icon")
      .click();
    await this.page
      .getByTestId("slice-action-icon-dropdown")
      .getByText(action, { exact: true })
      .click();
  }

  async openAddVariationDialog() {
    await this.addVariationButton.click();
  }

  /**
   * Assertions
   */
  async checkSavedMessage() {
    await expect(this.savedMessage).toBeVisible();
    await expect(this.savedMessage).not.toBeVisible();
  }
}
