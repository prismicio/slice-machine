import { expect, Locator, Page } from "@playwright/test";

import { AddFieldDialog } from "../components/AddFieldDialog";
import { EditFieldDialog } from "../components/EditFieldDialog";
import { SliceMachinePage } from "../SliceMachinePage";

export type FieldType =
  | "Rich Text"
  | "Image"
  | "Link"
  | "Link to media"
  | "Content Relationship"
  | "Select"
  | "Boolean"
  | "Date"
  | "Timestamp"
  | "Embed"
  | "Number"
  | "GeoPoint"
  | "Color"
  | "Key Text"
  | "Group";

export class BuilderPage extends SliceMachinePage {
  readonly addFieldDialog: AddFieldDialog;
  readonly editFieldDialog: EditFieldDialog;
  readonly saveButton: Locator;
  readonly showCodeSnippetsButton: Locator;
  readonly hideCodeSnippetsButton: Locator;
  readonly autoSaveStatusSaved: Locator;
  readonly autoSaveStatusSaving: Locator;
  readonly autoSaveStatusError: Locator;
  readonly autoSaveRetryButton: Locator;
  readonly staticZoneContent: Locator;
  readonly staticZoneAddFieldButton: Locator;
  readonly staticZonePlaceholder: Locator;
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
    this.addFieldDialog = new AddFieldDialog(page);
    this.editFieldDialog = new EditFieldDialog(page);

    /**
     * Static locators
     */
    // header
    this.saveButton = page.getByRole("button", { name: "Save", exact: true });
    this.showCodeSnippetsButton = page.getByRole("button", {
      name: "Show code snippets",
      exact: true,
    });
    this.hideCodeSnippetsButton = page.getByRole("button", {
      name: "Hide code snippets",
      exact: true,
    });
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
    this.staticZoneAddFieldButton = page.getByTestId("add-Static-field");
    this.staticZonePlaceholder = this.staticZoneContent.getByText(
      "Add a field to your Static Zone",
      { exact: true },
    );
    this.staticZoneListItem = this.staticZoneContent.getByRole("listitem");
    // Code snippets
    this.codeSnippetsFieldSwitch = page.getByTestId("code-snippets-switch");
    // New field
    this.newFieldNameInput = page.getByPlaceholder("Field Name");
    this.newFieldIdInput = page.getByPlaceholder("e.g. buttonLink");
    this.newFieldAddButton = page.getByRole("button", {
      name: "Add",
      exact: true,
    });
  }

  /**
   * Dynamic locators
   */
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

  getListItemFieldId(fieldId: string, groupFieldId?: string) {
    if (groupFieldId) {
      return this.getListItem(fieldId, groupFieldId)
        .getByTestId("field-id")
        .getByText(`data.${groupFieldId}.${fieldId}`, { exact: true });
    }

    return this.getListItem(fieldId)
      .getByTestId("field-id")
      .getByText(`data.${fieldId}`, { exact: true });
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

  /**
   * Actions
   */
  async addStaticField(args: {
    type: FieldType;
    name: string;
    expectedId: string;
    groupFieldId?: string;
  }) {
    const { type, name, expectedId, groupFieldId } = args;

    if (groupFieldId) {
      await this.getListItem(groupFieldId)
        .getByRole("button", {
          name: "Add Field",
          exact: true,
        })
        .click();
    } else {
      await this.staticZoneAddFieldButton.click();
    }

    await expect(this.addFieldDialog.title).toBeVisible();
    await this.addFieldDialog.selectField(type);
    await this.newFieldNameInput.fill(name);
    await expect(this.newFieldIdInput).toHaveValue(expectedId);
    await this.newFieldAddButton.click();
    await expect(this.addFieldDialog.title).not.toBeVisible();
  }

  async deleteField(fieldId: string, groupFieldId?: string) {
    await this.getFieldMenuButton(fieldId, groupFieldId).click();
    await this.page.getByRole("menuitem", { name: "Delete field" }).click();
  }

  async copyCodeSnippet(fieldId: string) {
    await this.getListItem(fieldId)
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
      this.getListItem(fieldId).getByRole("button", {
        name: "Code snippet copied",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      this.getListItem(fieldId).getByRole("button", {
        name: "Copy code snippet",
        exact: true,
      }),
    ).toBeVisible();
  }

  /**
   * Assertions
   */
  // Handle assertions here
}
