import { expect, Locator, Page } from "@playwright/test";

import { CreateTypeModal } from "../components/CreateTypeModal";
import { RenameTypeModal } from "../components/RenameTypeModal";
import { CustomTypesTablePage } from "../CustomTypesTablePage";
import { BuilderPage } from "./BuilderPage";

export class TypeBuilderPage extends BuilderPage {
  readonly createTypeModal: CreateTypeModal;
  readonly renameTypeModal: RenameTypeModal;
  readonly customTypeTablePage: CustomTypesTablePage;
  readonly savedMessage: Locator;
  readonly staticZone: Locator;
  readonly staticZonePlaceholder: Locator;
  readonly staticZoneListItem: Locator;

  constructor(page: Page, format: "page" | "custom") {
    super(page);

    /**
     * Components
     */
    this.createTypeModal = new CreateTypeModal(page, format);
    this.renameTypeModal = new RenameTypeModal(page, format);
    this.customTypeTablePage = new CustomTypesTablePage(page);

    /**
     * Static locators
     */
    // Global
    this.savedMessage = page.getByText(
      `${format.charAt(0).toUpperCase()}${format.slice(
        1,
      )} type saved successfully`,
    );
    // Static zone
    this.staticZone = page.getByTestId("ct-static-zone");
    this.staticZonePlaceholder = page.getByText(
      "Add a field to your Static Zone",
    );
    this.staticZoneListItem = this.staticZone.getByRole("listitem");
  }

  /**
   * Dynamic locators
   */
  // Handle dynamic locators here

  /**
   * Actions
   */
  async goto(name: string) {
    await this.customTypeTablePage.goto();
    await expect(this.customTypeTablePage.getRow(name)).toBeVisible();
    await this.customTypeTablePage.getRow(name).click();
  }

  /**
   *  Assertions
   */
  async checkSavedMessage() {
    await expect(this.savedMessage).toBeVisible();
    await expect(this.savedMessage).not.toBeVisible();
  }
}
