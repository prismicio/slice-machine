import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import { generateRandomId } from "../../utils";

test("I see that linked content relationships are updated when a field API ID is renamed", async ({
  customTypesTablePage,
  pageTypesBuilderPage,
  customTypesBuilderPage,
  page,
}) => {
  // Setup: Create two custom types and add a relationship between them

  await customTypesTablePage.goto();
  await customTypesTablePage.openCreateDialog();

  const randomId = generateRandomId();
  const ct1Name = "Custom Type " + randomId;
  const ct1Id = `custom_type_${randomId}`;
  await customTypesTablePage.createTypeDialog.createType(ct1Name, "reusable");

  await expect(customTypesBuilderPage.getTab("Main")).toBeVisible();

  await pageTypesBuilderPage.addStaticField({
    type: "Rich Text",
    name: "My Regular Field",
    expectedId: "my_regular_field",
  });

  await pageTypesBuilderPage.addStaticField({
    type: "Repeatable Group",
    name: "My Group",
    expectedId: "my_group",
  });
  await pageTypesBuilderPage.addStaticField({
    type: "Rich Text",
    name: "My Field Inside Group",
    expectedId: "my_field_inside_group",
    groupFieldId: "my_group",
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

  await page.getByRole("button", { name: "Add type" }).click();

  await page.getByRole("menuitem", { name: ct1Id }).click();

  await page.getByLabel("my_regular_field").click();

  await page
    .getByRole("button", { name: "Expand item" })
    .getByText("my_group")
    .click();
  await page.getByLabel("my_field_inside_group").click();

  await pageTypesBuilderPage.editFieldDialog.submitButton.click();

  // Go to the first custom type and rename the field API id

  await customTypesTablePage.goto();

  const customTypeRow = customTypesTablePage.getRow(ct1Id);
  await expect(customTypeRow).toBeVisible();

  await customTypeRow.click();

  await expect(
    pageTypesBuilderPage.getListItemFieldId("my_regular_field"),
  ).toBeVisible();

  await pageTypesBuilderPage.getEditFieldButton("my_regular_field").click();

  await pageTypesBuilderPage.editFieldDialog.editField({
    name: "My Regular Field",
    newName: "My Regular Field Renamed",
    newId: "my_regular_field_renamed",
  });

  await expect(pageTypesBuilderPage.autoSaveStatusSaved).toBeVisible();

  await pageTypesBuilderPage.getEditFieldButton("my_group").first().click();

  await pageTypesBuilderPage.editFieldDialog.editField({
    name: "My Group",
    newName: "My Group Renamed",
    newId: "my_group_renamed",
  });

  // Check that the custom relationship was also updated

  await customTypesTablePage.goto();

  await customTypesTablePage.getRow(ct2Id).click();

  await expect(
    pageTypesBuilderPage.getListItemFieldId("my_content_relationship"),
  ).toBeVisible();

  await pageTypesBuilderPage
    .getEditFieldButton("my_content_relationship")
    .click();

  await expect(page.getByLabel("my_regular_field_renamed")).toBeChecked();

  await page
    .getByRole("button", { name: "Expand item" })
    .getByText("my_group_renamed")
    .click();
  await expect(page.getByText("my_group_renamed")).toBeVisible();
  await expect(page.getByLabel("my_field_inside_group")).toBeChecked();
});
