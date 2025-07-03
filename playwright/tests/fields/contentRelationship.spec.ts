import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import { generateRandomId } from "../../utils";

test("I see that linked content relationships are updated when a field API ID is renamed", async ({
  customTypesTablePage,
  pageTypesBuilderPage,
  customTypesBuilderPage,
  page,
}) => {
  // Create custom type A

  await customTypesTablePage.goto();
  await customTypesTablePage.openCreateDialog();

  const customTypeAId = `custom_type_${generateRandomId()}`;
  await customTypesTablePage.createTypeDialog.createType(
    customTypeAId,
    "reusable",
  );

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

  // Create custom type B

  await customTypesTablePage.goto();
  await customTypesTablePage.openCreateDialog();

  const customTypeBId = `custom_type_${generateRandomId()}`;
  await customTypesTablePage.createTypeDialog.createType(
    customTypeBId,
    "reusable",
  );

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

  await page.getByRole("menuitem", { name: customTypeAId }).click();

  await page.getByLabel("my_regular_field").click();

  await page
    .getByRole("button", { name: "Expand item" })
    .getByText("my_group")
    .click();
  await page.getByLabel("my_field_inside_group").click();

  await pageTypesBuilderPage.editFieldDialog.submitButton.click();

  // Go to the first custom type and rename the field API id

  await customTypesTablePage.goto();

  const customTypeRow = customTypesTablePage.getRow(customTypeAId);
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

  await customTypesTablePage.getRow(customTypeBId).click();

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

test("I can select fields from a nested content relationship up to level 2 and then remove the type", async ({
  customTypesTablePage,
  pageTypesBuilderPage,
  customTypesBuilderPage,
  page,
}) => {
  // Create a custom type A

  await customTypesTablePage.goto();
  await customTypesTablePage.openCreateDialog();

  const customTypeAId = `custom_type_${generateRandomId()}`;
  await customTypesTablePage.createTypeDialog.createType(
    customTypeAId,
    "reusable",
  );

  // Create custom type A

  await customTypesTablePage.goto();
  await customTypesTablePage.openCreateDialog();

  const customTypeBId = `custom_type_${generateRandomId()}`;
  await customTypesTablePage.createTypeDialog.createType(
    customTypeBId,
    "reusable",
  );

  await expect(customTypesBuilderPage.getTab("Main")).toBeVisible();

  await pageTypesBuilderPage.addStaticField({
    type: "Rich Text",
    name: "My Regular Field",
    expectedId: "my_regular_field",
  });

  await pageTypesBuilderPage.addStaticField({
    type: "Content Relationship",
    name: "My Content Relationship With CT A",
    expectedId: "my_content_relationship_with_ct_a",
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

  // Create custom type C

  await customTypesTablePage.goto();
  await customTypesTablePage.openCreateDialog();

  const customTypeCId = `custom_type_${generateRandomId()}`;
  await customTypesTablePage.createTypeDialog.createType(
    customTypeCId,
    "reusable",
  );

  await expect(customTypesBuilderPage.getTab("Main")).toBeVisible();

  await pageTypesBuilderPage.addStaticField({
    type: "Content Relationship",
    name: "My Content Relationship With CT B",
    expectedId: "my_content_relationship_with_ct_b",
  });

  await expect(
    pageTypesBuilderPage.getListItemFieldId(
      "my_content_relationship_with_ct_b",
    ),
  ).toBeVisible();

  await pageTypesBuilderPage
    .getEditFieldButton("my_content_relationship_with_ct_b")
    .click();

  await page.getByRole("button", { name: "Add type" }).click();
  await page.getByRole("menuitem", { name: customTypeBId }).click();

  await pageTypesBuilderPage.editFieldDialog.submitButton.click();

  // Create custom type D

  await customTypesTablePage.goto();
  await customTypesTablePage.openCreateDialog();

  const customTypeDId = `custom_type_${generateRandomId()}`;
  await customTypesTablePage.createTypeDialog.createType(
    customTypeDId,
    "reusable",
  );

  await expect(customTypesBuilderPage.getTab("Main")).toBeVisible();

  await pageTypesBuilderPage.addStaticField({
    type: "Content Relationship",
    name: "My Content Relationship With CT C",
    expectedId: "my_content_relationship_with_ct_c",
  });

  await expect(
    pageTypesBuilderPage.getListItemFieldId(
      "my_content_relationship_with_ct_c",
    ),
  ).toBeVisible();

  await pageTypesBuilderPage
    .getEditFieldButton("my_content_relationship_with_ct_c")
    .click();

  await page.getByRole("button", { name: "Add type" }).click();
  await page.getByRole("menuitem", { name: customTypeCId }).click();

  // Expand every section
  await page
    .getByRole("button", { name: "Expand item" })
    .getByText("my_content_relationship_with_ct_b")
    .click();
  await page
    .getByRole("button", { name: "Expand item" })
    .getByText("my_group")
    .click();

  // Check the fields

  await page.getByLabel("my_field_inside_group").click();
  await page.getByLabel("my_content_relationship_with_ct_a").click();
  await page.getByLabel("my_regular_field").click();

  await pageTypesBuilderPage.editFieldDialog.submitButton.click();

  // Expect UI changes

  await expect(
    pageTypesBuilderPage.getListItemFieldId(
      "my_content_relationship_with_ct_c",
    ),
  ).toBeVisible();

  await pageTypesBuilderPage
    .getEditFieldButton("my_content_relationship_with_ct_c")
    .click();

  // Expand every section
  await page
    .getByRole("button", { name: "Expand item" })
    .getByText("my_content_relationship_with_ct_b")
    .click();
  await page
    .getByRole("button", { name: "Expand item" })
    .getByText("my_group")
    .click();

  // Check that the fields are still checked

  await expect(page.getByLabel("my_field_inside_group")).toBeChecked();
  await expect(
    page.getByLabel("my_content_relationship_with_ct_a"),
  ).toBeChecked();
  await expect(page.getByLabel("my_regular_field")).toBeChecked();

  // root custom type
  await expect(page.getByText("(3 fields returned in the API)")).toBeVisible();
  // nested custom type
  await expect(page.getByText("(3 fields selected)")).toBeVisible();
  // group
  await expect(page.getByText("(1 field selected)")).toBeVisible();

  // Remove the type
  await page.getByRole("button", { name: "Remove type" }).click();
  await expect(page.getByText("No type selected")).toBeVisible();
});

test("I can see a 'No available fields to select' label for groups and nested custom types", async ({
  customTypesTablePage,
  pageTypesBuilderPage,
  customTypesBuilderPage,
  page,
}) => {
  // Create custom type A

  await customTypesTablePage.goto();
  await customTypesTablePage.openCreateDialog();

  const customTypeAId = `custom_type_${generateRandomId()}`;
  await customTypesTablePage.createTypeDialog.createType(
    customTypeAId,
    "reusable",
  );

  // Create custom type B

  await customTypesTablePage.goto();
  await customTypesTablePage.openCreateDialog();

  const customTypeBId = `custom_type_${generateRandomId()}`;
  await customTypesTablePage.createTypeDialog.createType(
    customTypeBId,
    "reusable",
  );

  await expect(customTypesBuilderPage.getTab("Main")).toBeVisible();

  await pageTypesBuilderPage.addStaticField({
    type: "Content Relationship",
    name: "My Content Relationship With CT A",
    expectedId: "my_content_relationship_with_ct_a",
  });

  await pageTypesBuilderPage.addStaticField({
    type: "Repeatable Group",
    name: "My Group B",
    expectedId: "my_group_b",
  });

  await expect(
    pageTypesBuilderPage.getListItemFieldId(
      "my_content_relationship_with_ct_a",
    ),
  ).toBeVisible();

  await pageTypesBuilderPage
    .getEditFieldButton("my_content_relationship_with_ct_a")
    .click();

  await page.getByRole("button", { name: "Add type" }).click();
  await page.getByRole("menuitem", { name: customTypeAId }).click();

  await pageTypesBuilderPage.editFieldDialog.submitButton.click();

  // Create custom type C

  await customTypesTablePage.goto();
  await customTypesTablePage.openCreateDialog();

  const customTypeCId = `custom_type_${generateRandomId()}`;
  await customTypesTablePage.createTypeDialog.createType(
    customTypeCId,
    "reusable",
  );

  await expect(customTypesBuilderPage.getTab("Main")).toBeVisible();

  await pageTypesBuilderPage.addStaticField({
    type: "Content Relationship",
    name: "My Content Relationship With CT B",
    expectedId: "my_content_relationship_with_ct_b",
  });

  await expect(
    pageTypesBuilderPage.getListItemFieldId(
      "my_content_relationship_with_ct_b",
    ),
  ).toBeVisible();

  await pageTypesBuilderPage
    .getEditFieldButton("my_content_relationship_with_ct_b")
    .click();

  await page.getByRole("button", { name: "Add type" }).click();
  await page.getByRole("menuitem", { name: customTypeBId }).click();

  // Expand every section
  await page
    .getByRole("button", { name: "Expand item" })
    .getByText("my_content_relationship_with_ct_a")
    .click();
  await page
    .getByRole("button", { name: "Expand item" })
    .getByText("my_group_b")
    .click();

  await expect(page.getByText("No available fields to select")).toHaveCount(2);
});
