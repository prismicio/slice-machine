import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import { generateRandomId } from "../../utils";

test("I see that linked content relationships are updated when a field API ID is renamed", async ({
  customTypesTablePage,
  pageTypesBuilderPage,
  page,
}) => {
  // Create custom type A

  await customTypesTablePage.goto();
  await customTypesTablePage.openCreateDialog();
  const customTypeAId = `custom_type_a_${generateRandomId()}`;
  await customTypesTablePage.createTypeDialog.createType(
    customTypeAId,
    "reusable",
  );
  await pageTypesBuilderPage.addStaticField({
    type: "Rich Text",
    name: "Regular Field",
    expectedId: "regular_field",
  });
  await pageTypesBuilderPage.addStaticField({
    type: "Repeatable Group",
    name: "Group Field",
    expectedId: "group_field",
  });
  await pageTypesBuilderPage.addStaticField({
    type: "Rich Text",
    name: "Field Inside Group",
    expectedId: "field_inside_group",
    groupFieldId: "group_field",
  });

  // Create custom type B

  await customTypesTablePage.goto();
  await customTypesTablePage.openCreateDialog();
  const customTypeBId = `custom_type_${generateRandomId()}`;
  await customTypesTablePage.createTypeDialog.createType(
    customTypeBId,
    "reusable",
  );
  await pageTypesBuilderPage.addStaticField({
    type: "Content Relationship",
    name: "CR With A",
    expectedId: "cr_with_a",
  });

  // Link to custom type A

  await pageTypesBuilderPage.getEditFieldButton("cr_with_a").click();
  await page.getByRole("button", { name: "Add type" }).click();
  await page.getByRole("menuitem", { name: customTypeAId }).click();
  await page.getByLabel("regular_field").click();
  await page
    .getByRole("button", { name: "Expand item" })
    .getByText("group_field")
    .click();
  await page.getByLabel("field_inside_group").click();

  await pageTypesBuilderPage.editFieldDialog.submitButton.click();

  // Go to the first custom type and rename the field API id

  await customTypesTablePage.goto();
  await customTypesTablePage.getRow(customTypeAId).click();
  await pageTypesBuilderPage.getEditFieldButton("regular_field").click();

  await pageTypesBuilderPage.editFieldDialog.editField({
    name: "Regular Field",
    newName: "Regular Field Renamed",
    newId: "regular_field_renamed",
  });

  await expect(pageTypesBuilderPage.autoSaveStatusSaved).toBeVisible();

  await pageTypesBuilderPage.getEditFieldButton("group_field").first().click();

  await pageTypesBuilderPage.editFieldDialog.editField({
    name: "Group Field",
    newName: "Group Field Renamed",
    newId: "group_field_renamed",
  });

  // Expect the custom relationship to be updated with the new API ID

  await customTypesTablePage.goto();
  await customTypesTablePage.getRow(customTypeBId).click();
  await pageTypesBuilderPage.getEditFieldButton("cr_with_a").click();

  await expect(page.getByLabel("regular_field_renamed")).toBeChecked();
  await page
    .getByRole("button", { name: "Expand item" })
    .getByText("group_field_renamed")
    .click();
  await expect(page.getByText("group_field_renamed")).toBeVisible();
  await expect(page.getByLabel("field_inside_group")).toBeChecked();
});

test("I can select fields from a nested content relationship up to level 2 and then remove the type", async ({
  customTypesTablePage,
  pageTypesBuilderPage,
  page,
}) => {
  // Create a custom type A

  await customTypesTablePage.goto();
  await customTypesTablePage.openCreateDialog();
  const customTypeAId = `custom_type_a_${generateRandomId()}`;
  await customTypesTablePage.createTypeDialog.createType(
    customTypeAId,
    "reusable",
  );

  // Create custom type B

  await customTypesTablePage.goto();
  await customTypesTablePage.openCreateDialog();
  const customTypeBId = `custom_type_b_${generateRandomId()}`;
  await customTypesTablePage.createTypeDialog.createType(
    customTypeBId,
    "reusable",
  );
  await pageTypesBuilderPage.addStaticField({
    type: "Rich Text",
    name: "Regular Field",
    expectedId: "regular_field",
  });
  await pageTypesBuilderPage.addStaticField({
    type: "Content Relationship",
    name: "CR With A Field",
    expectedId: "cr_with_a_field",
  });

  // Link to custom type A
  await pageTypesBuilderPage.getEditFieldButton("cr_with_a_field").click();
  await page.getByRole("button", { name: "Add type" }).click();
  await page.getByRole("menuitem", { name: customTypeAId }).click();
  await pageTypesBuilderPage.editFieldDialog.submitButton.click();

  await pageTypesBuilderPage.addStaticField({
    type: "Repeatable Group",
    name: "Group Field",
    expectedId: "group_field",
  });
  await pageTypesBuilderPage.addStaticField({
    type: "Rich Text",
    name: "Field Inside Group",
    expectedId: "field_inside_group",
    groupFieldId: "group_field",
  });

  // Create custom type C

  await customTypesTablePage.goto();
  await customTypesTablePage.openCreateDialog();
  const customTypeCId = `custom_type_c_${generateRandomId()}`;
  await customTypesTablePage.createTypeDialog.createType(
    customTypeCId,
    "reusable",
  );
  await pageTypesBuilderPage.addStaticField({
    type: "Content Relationship",
    name: "CR With B Field",
    expectedId: "cr_with_b_field",
  });

  // Link to custom type B

  await pageTypesBuilderPage.getEditFieldButton("cr_with_b_field").click();
  await page.getByRole("button", { name: "Add type" }).click();
  await page.getByRole("menuitem", { name: customTypeBId }).click();

  await pageTypesBuilderPage.editFieldDialog.submitButton.click();

  // Create custom type D

  await customTypesTablePage.goto();
  await customTypesTablePage.openCreateDialog();
  const customTypeDId = `custom_type_d_${generateRandomId()}`;
  await customTypesTablePage.createTypeDialog.createType(
    customTypeDId,
    "reusable",
  );
  await pageTypesBuilderPage.addStaticField({
    type: "Content Relationship",
    name: "CR With C Field",
    expectedId: "cr_with_c_field",
  });

  // Link to custom type C

  await pageTypesBuilderPage.getEditFieldButton("cr_with_c_field").click();
  await page.getByRole("button", { name: "Add type" }).click();
  await page.getByRole("menuitem", { name: customTypeCId }).click();

  // Expand every section
  await page
    .getByRole("button", { name: "Expand item" })
    .getByText("cr_with_b_field")
    .click();
  await page
    .getByRole("button", { name: "Expand item" })
    .getByText("group_field")
    .click();

  // Check the fields and submit

  await page.getByLabel("field_inside_group").click();
  await page.getByLabel("cr_with_a_field").click();
  await page.getByLabel("regular_field").click();
  await pageTypesBuilderPage.editFieldDialog.submitButton.click();

  await pageTypesBuilderPage.getEditFieldButton("cr_with_c_field").click();

  // Expand every section

  await page
    .getByRole("button", { name: "Expand item" })
    .getByText("cr_with_b_field")
    .click();
  await page
    .getByRole("button", { name: "Expand item" })
    .getByText("group_field")
    .click();

  // Check that the fields are still checked

  await expect(page.getByLabel("field_inside_group")).toBeChecked();
  await expect(page.getByLabel("cr_with_a_field")).toBeChecked();
  await expect(page.getByLabel("regular_field")).toBeChecked();

  // Check that the count labels are correct

  await expect(page.getByText("(3 fields returned in the API)")).toBeVisible(); // root custom type
  await expect(page.getByText("(3 fields selected)")).toBeVisible(); // nested custom type
  await expect(page.getByText("(1 field selected)")).toBeVisible(); // group

  // Remove the type

  await page.getByRole("button", { name: "Remove type" }).click();
  await expect(page.getByText("No type selected")).toBeVisible();
});

test("I can see a 'No available fields to select' label for groups and nested custom types", async ({
  customTypesTablePage,
  pageTypesBuilderPage,
  page,
}) => {
  // Create custom type A

  await customTypesTablePage.goto();
  await customTypesTablePage.openCreateDialog();
  const customTypeAId = `custom_type_a_${generateRandomId()}`;
  await customTypesTablePage.createTypeDialog.createType(
    customTypeAId,
    "reusable",
  );

  // Create custom type B

  await customTypesTablePage.goto();
  await customTypesTablePage.openCreateDialog();
  const customTypeBId = `custom_type_b_${generateRandomId()}`;
  await customTypesTablePage.createTypeDialog.createType(
    customTypeBId,
    "reusable",
  );
  await pageTypesBuilderPage.addStaticField({
    type: "Content Relationship",
    name: "CR With A Field",
    expectedId: "cr_with_a_field",
  });
  await pageTypesBuilderPage.addStaticField({
    type: "Repeatable Group",
    name: "Group Field",
    expectedId: "group_field",
  });

  // Link to custom type A

  await pageTypesBuilderPage.getEditFieldButton("cr_with_a_field").click();
  await page.getByRole("button", { name: "Add type" }).click();
  await page.getByRole("menuitem", { name: customTypeAId }).click();

  await pageTypesBuilderPage.editFieldDialog.submitButton.click();

  // Create custom type C

  await customTypesTablePage.goto();
  await customTypesTablePage.openCreateDialog();
  const customTypeCId = `custom_type_c_${generateRandomId()}`;
  await customTypesTablePage.createTypeDialog.createType(
    customTypeCId,
    "reusable",
  );
  await pageTypesBuilderPage.addStaticField({
    type: "Content Relationship",
    name: "CR With B Field",
    expectedId: "cr_with_b_field",
  });

  // Link to custom type B

  await pageTypesBuilderPage.getEditFieldButton("cr_with_b_field").click();
  await page.getByRole("button", { name: "Add type" }).click();
  await page.getByRole("menuitem", { name: customTypeBId }).click();

  // Expand every section

  await page
    .getByRole("button", { name: "Expand item" })
    .getByText("cr_with_a_field")
    .click();
  await page
    .getByRole("button", { name: "Expand item" })
    .getByText("group_field")
    .click();

  // Check that we see the correct labels

  await expect(page.getByText("No available fields to select")).toHaveCount(2);
});
