import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import { generateRandomId } from "../../utils";

test("I see that linked content relationships are updated when a custom type API ID is renamed", async ({
  customTypesTablePage,
  pageTypesBuilderPage,
  customTypesBuilderPage,
  page,
}) => {
  // Setup: Create two custom types and add a relationship between them
  // TODO: Replace manual creation of custom types with something faster

  await customTypesTablePage.goto();
  await customTypesTablePage.openCreateDialog();

  const randomId = generateRandomId();
  const ct1Name = "Custom Type " + randomId;
  const ct1Id = `custom_type_${randomId}`;
  await customTypesTablePage.createTypeDialog.createType(ct1Name, "reusable");

  await expect(customTypesBuilderPage.getTab("Main")).toBeVisible();

  await pageTypesBuilderPage.addStaticField({
    type: "Rich Text",
    name: "My Rich Text",
    expectedId: "my_rich_text",
  });

  await customTypesTablePage.goto();

  await customTypesTablePage.openCreateDialog();

  const randomId2 = generateRandomId();
  const ct2Name = "Custom Type " + randomId2;
  const ct2Id = `custom_type_${randomId2}`;
  await customTypesTablePage.createTypeDialog.createType(ct2Name, "reusable");

  await expect(customTypesBuilderPage.getTab("Main")).toBeVisible();

  await pageTypesBuilderPage.addStaticField({
    type: "Content Relationship",
    name: "My Content Relationship",
    expectedId: "my_content_relationship",
  });

  await expect(
    pageTypesBuilderPage.getListItemFieldId("my_content_relationship"),
  ).toBeVisible();

  await pageTypesBuilderPage
    .getEditFieldButton("my_content_relationship")
    .click();

  const section = page.getByRole("button", { name: "Expand item" });
  await section.getByText(ct1Id).click();

  await page.getByLabel("my_rich_text").click();

  await pageTypesBuilderPage.editFieldDialog.submitButton.click();

  // Go to the first custom type and rename the field API id

  await customTypesTablePage.goto();

  const customTypeRow = customTypesTablePage.getRow(ct1Id);
  await expect(customTypeRow).toBeVisible();

  await customTypeRow.click();

  await expect(
    pageTypesBuilderPage.getListItemFieldId("my_rich_text"),
  ).toBeVisible();

  await pageTypesBuilderPage.getEditFieldButton("my_rich_text").click();

  await pageTypesBuilderPage.editFieldDialog.editField({
    name: "My Rich Text",
    newName: "My Rich Text Renamed",
    newId: "my_rich_text_renamed",
  });

  await expect(pageTypesBuilderPage.autoSaveStatusSaved).toBeVisible();

  // Check that the custom relationship was also updated

  await customTypesTablePage.goto();

  await customTypesTablePage.getRow(ct2Id).click();

  await expect(
    pageTypesBuilderPage.getListItemFieldId("my_content_relationship"),
  ).toBeVisible();

  await pageTypesBuilderPage
    .getEditFieldButton("my_content_relationship")
    .click();

  await page
    .getByRole("button", { name: "Expand item" })
    .getByText(ct1Id)
    .click();

  await expect(page.getByLabel("my_rich_text_renamed")).toBeChecked();
});
