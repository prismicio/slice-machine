import { Locator, Page } from "@playwright/test";

import { AddFieldDropdown } from "../components/AddFieldDropdown";
import { EditFieldDialog } from "../components/EditFieldDialog";
import { SliceMachinePage } from "../SliceMachinePage";

export class BuilderPage extends SliceMachinePage {
  readonly addFieldDropdown: AddFieldDropdown;
  readonly editFieldDialog: EditFieldDialog;
  readonly saveButton: Locator;
  readonly autoSaveStatusSaved: Locator;
  readonly autoSaveStatusSaving: Locator;
  readonly autoSaveStatusError: Locator;
  readonly autoSaveRetryButton: Locator;
  readonly staticZoneContent: Locator;
  readonly staticZoneAddFieldButton: Locator;
  readonly staticZoneListItem: Locator;
  readonly codeSnippetsFieldSwitch: Locator;
  readonly newFieldNameInput: Locator;
  readonly newFieldIdInput: Locator;
  readonly newFieldAddButton: Locator;

  constructor(page: Page) {
    super(page);

    /**
     * Components
     */
    this.addFieldDropdown = new AddFieldDropdown(page);
    this.editFieldDialog = new EditFieldDialog(page);

    /**
     * Static locators
     */
    // header
    this.saveButton = page.getByRole("button", { name: "Save", exact: true });
    // Auto save status
    this.autoSaveStatusSaved = page.getByText("Auto-saved", { exact: true });
    this.autoSaveStatusSaving = page.getByText("Saving...", { exact: true });
    this.autoSaveStatusError = page.getByText("Failed to save", {
      exact: true,
    });
    this.autoSaveRetryButton = page.getByRole("button", {
      name: "Retry",
      exact: true,
    });
    // Static zone
    this.staticZoneContent = page.getByTestId("static-zone-content");
    this.staticZoneAddFieldButton = page.getByTestId("add-field");
    this.staticZoneListItem = this.staticZoneContent.getByRole("listitem");
    // Code snippets
    this.codeSnippetsFieldSwitch = page.getByTestId("code-snippets-switch");
    // New field
    this.newFieldNameInput = page.getByPlaceholder("Field Name");
    this.newFieldIdInput = page.getByPlaceholder("e.g. buttonLink");
    this.newFieldAddButton = page.getByTestId("new-field-add-button");
  }

  /**
   * Dynamic locators
   */
  // Handle dynamic locators here

  /**
   * Actions
   */
  // Handle actions here

  /**
   * Assertions
   */
  // Handle assertions here
}
