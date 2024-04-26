import { expect } from "@playwright/test";

import { test } from "../../fixtures";

test("I can see default SEO & Metadata tab fields", async ({
  pageTypesBuilderPage,
  reusablePageTypeFromUI,
}) => {
  await pageTypesBuilderPage.goto(reusablePageTypeFromUI.name);
  await pageTypesBuilderPage.getTab("SEO & Metadata").click();

  await expect(
    pageTypesBuilderPage.getListItemFieldId("meta_description"),
  ).toBeVisible();
  await expect(
    pageTypesBuilderPage.getListItemFieldName(
      "meta_description",
      "Meta Description",
    ),
  ).toBeVisible();

  await expect(
    pageTypesBuilderPage.getListItemFieldId("meta_image"),
  ).toBeVisible();
  await expect(
    pageTypesBuilderPage.getListItemFieldName("meta_image", "Meta Image"),
  ).toBeVisible();

  await expect(
    pageTypesBuilderPage.getListItemFieldId("meta_title"),
  ).toBeVisible();
  await expect(
    pageTypesBuilderPage.getListItemFieldName("meta_title", "Meta Title"),
  ).toBeVisible();
});

test("I can add a rich text field", async ({
  pageTypesBuilderPage,
  reusablePageType,
}) => {
  await pageTypesBuilderPage.goto(reusablePageType.name);
  await pageTypesBuilderPage.addStaticField({
    type: "Rich Text",
    name: "My Rich Text",
    expectedId: "my_rich_text",
  });

  await expect(
    pageTypesBuilderPage.getListItemFieldId("my_rich_text"),
  ).toBeVisible();
  await expect(
    pageTypesBuilderPage.getListItemFieldName("my_rich_text", "My Rich Text"),
  ).toBeVisible();
});

test("I can edit a rich text field", async ({
  pageTypesBuilderPage,
  reusablePageType,
}) => {
  await pageTypesBuilderPage.goto(reusablePageType.name);
  await pageTypesBuilderPage.addStaticField({
    type: "Rich Text",
    name: "My Rich Text",
    expectedId: "my_rich_text",
  });

  await pageTypesBuilderPage.getEditFieldButton("my_rich_text").click();
  await pageTypesBuilderPage.editFieldDialog.editField({
    name: "My Rich Text",
    newName: "My Rich Text Renamed",
    newId: "my_rich_text_renamed",
  });

  await expect(
    pageTypesBuilderPage.getListItemFieldId("my_rich_text_renamed"),
  ).toBeVisible();
  await expect(
    pageTypesBuilderPage.getListItemFieldName(
      "my_rich_text_renamed",
      "My Rich Text Renamed",
    ),
  ).toBeVisible();
});

test("I can delete a field", async ({
  pageTypesBuilderPage,
  reusablePageType,
}) => {
  await pageTypesBuilderPage.goto(reusablePageType.name);
  await pageTypesBuilderPage.addStaticField({
    type: "Rich Text",
    name: "My Rich Text",
    expectedId: "my_rich_text",
  });

  await pageTypesBuilderPage.deleteField("my_rich_text");

  await expect(
    pageTypesBuilderPage.getListItemFieldId("my_rich_text"),
  ).not.toBeVisible();
});

test("I can add a sub field within a group field", async ({
  pageTypesBuilderPage,
  reusablePageType,
}) => {
  await pageTypesBuilderPage.goto(reusablePageType.name);
  await pageTypesBuilderPage.addStaticField({
    type: "Group",
    name: "My Group",
    expectedId: "my_group",
  });
  await pageTypesBuilderPage.addStaticField({
    type: "Rich Text",
    name: "My Sub Field",
    expectedId: "my_sub_field",
    groupFieldId: "my_group",
  });

  await expect(
    pageTypesBuilderPage.getListItemFieldId("my_sub_field", "my_group"),
  ).toBeVisible();
  await expect(
    pageTypesBuilderPage.getListItemFieldName(
      "my_sub_field",
      "My Sub Field",
      "my_group",
    ),
  ).toBeVisible();
});

test("I can edit a sub field within a group field", async ({
  pageTypesBuilderPage,
  reusablePageType,
}) => {
  await pageTypesBuilderPage.goto(reusablePageType.name);
  await pageTypesBuilderPage.addStaticField({
    type: "Group",
    name: "My Group",
    expectedId: "my_group",
  });
  await pageTypesBuilderPage.addStaticField({
    type: "Rich Text",
    name: "My Sub Field",
    expectedId: "my_sub_field",
    groupFieldId: "my_group",
  });

  await pageTypesBuilderPage
    .getEditFieldButton("my_sub_field", "my_group")
    .click();
  await pageTypesBuilderPage.editFieldDialog.editField({
    name: "My Sub Field",
    newName: "My Sub Field Renamed",
    newId: "my_sub_field_renamed",
  });

  await expect(
    pageTypesBuilderPage.getListItemFieldId("my_sub_field_renamed", "my_group"),
  ).toBeVisible();
  await expect(
    pageTypesBuilderPage.getListItemFieldName(
      "my_sub_field_renamed",
      "My Sub Field Renamed",
      "my_group",
    ),
  ).toBeVisible();
});

test("I can delete a sub field within a group field", async ({
  pageTypesBuilderPage,
  reusablePageType,
}) => {
  await pageTypesBuilderPage.goto(reusablePageType.name);
  await pageTypesBuilderPage.addStaticField({
    type: "Group",
    name: "My Group",
    expectedId: "my_group",
  });
  await pageTypesBuilderPage.addStaticField({
    type: "Rich Text",
    name: "My Sub Field",
    expectedId: "my_sub_field",
    groupFieldId: "my_group",
  });

  await pageTypesBuilderPage.deleteField("my_sub_field", "my_group");

  await expect(
    pageTypesBuilderPage.getListItemFieldId("my_sub_field", "my_group"),
  ).not.toBeVisible();
});

test("I can see and copy the code snippets", async ({
  pageTypesBuilderPage,
  reusablePageType,
}) => {
  await pageTypesBuilderPage.goto(reusablePageType.name);
  await pageTypesBuilderPage.addStaticField({
    type: "Rich Text",
    name: "My Rich Text",
    expectedId: "my_rich_text",
  });

  await expect(pageTypesBuilderPage.codeSnippetsFieldSwitch).not.toBeChecked();
  await pageTypesBuilderPage.codeSnippetsFieldSwitch.click();
  await expect(pageTypesBuilderPage.codeSnippetsFieldSwitch).toBeChecked();
  await pageTypesBuilderPage.copyCodeSnippet("my_rich_text");
});

test("I can see and copy the code snippets for groups", async ({
  pageTypesBuilderPage,
  reusablePageType,
}) => {
  await pageTypesBuilderPage.goto(reusablePageType.name);
  await pageTypesBuilderPage.addStaticField({
    type: "Group",
    name: "My Group",
    expectedId: "my_group",
  });

  await expect(pageTypesBuilderPage.codeSnippetsFieldSwitch).not.toBeChecked();
  await pageTypesBuilderPage.codeSnippetsFieldSwitch.click();
  await expect(pageTypesBuilderPage.codeSnippetsFieldSwitch).toBeChecked();
  await pageTypesBuilderPage.copyCodeSnippet("my_group");
});

test("I cannot delete default UID field for reusable page type", async ({
  pageTypesBuilderPage,
  reusablePageTypeFromUI,
}) => {
  await pageTypesBuilderPage.goto(reusablePageTypeFromUI.name);

  await expect(
    pageTypesBuilderPage.getFieldMenuButton("uid"),
  ).not.toBeVisible();
});

test("I cannot see default UID field for single page type", async ({
  pageTypesBuilderPage,
  singlePageType,
}) => {
  await pageTypesBuilderPage.goto(singlePageType.name);

  await expect(
    pageTypesBuilderPage.getListItemFieldId("uid"),
  ).not.toBeVisible();
});
