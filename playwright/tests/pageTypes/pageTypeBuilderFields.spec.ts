import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import { generateRandomString } from "../../utils";

test("I can see default SEO & Metadata tab fields", async ({
  pageTypesBuilderPage,
  reusablePageType,
}) => {
  await pageTypesBuilderPage.goto(reusablePageType.name);
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

test.describe("Static zone info modal", () => {
  test.use({ onboarded: false });

  test("I can see the info modal the first time I try to add a new field", async ({
    pageTypesBuilderPage,
    reusablePageType,
  }) => {
    await pageTypesBuilderPage.goto(reusablePageType.name);
    await pageTypesBuilderPage.staticZoneAddFieldButton.click();
    await pageTypesBuilderPage.staticZoneInfoDialogConfirmCta.click();
    await pageTypesBuilderPage.addFieldDropdown.menu.isVisible();
  });
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
    pageTypesBuilderPage.menu.fieldAddedSuccessMessage,
  ).toBeVisible();
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
    type: "Repeatable Group",
    name: "My Group",
    expectedId: "my_group",
  });

  await expect(
    pageTypesBuilderPage.menu.groupAddedSuccessMessage,
  ).toBeVisible();

  await pageTypesBuilderPage.addStaticField({
    type: "Rich Text",
    name: "My Sub Field",
    expectedId: "my_sub_field",
    groupFieldId: "my_group",
  });

  await expect(
    pageTypesBuilderPage.menu.fieldAddedSuccessMessage,
  ).toBeVisible();

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
    type: "Repeatable Group",
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
    type: "Repeatable Group",
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

test("I can add a nested group with a sub field inside a group field", async ({
  pageTypesBuilderPage,
  procedures,
  reusablePageType,
}) => {
  procedures.mock(
    "telemetry.getExperimentVariant",
    ({ args }) =>
      args[0] === "slicemachine-nested-groups" ? { value: "on" } : undefined,
    { execute: false },
  );

  await pageTypesBuilderPage.goto(reusablePageType.name);
  await pageTypesBuilderPage.addStaticField({
    type: "Repeatable Group",
    name: "My Group",
    expectedId: "my_group",
  });
  await pageTypesBuilderPage.addStaticField({
    type: "Repeatable Group",
    name: "My Nested Group",
    expectedId: "my_nested_group",
    groupFieldId: "my_group",
  });
  await pageTypesBuilderPage.addStaticField({
    type: "Rich Text",
    name: "My Nested Group Sub Field",
    expectedId: "my_nested_group_sub_field",
    groupFieldId: "my_nested_group",
    grandparentGroupFieldId: "my_group",
  });

  await expect(
    pageTypesBuilderPage.getListItemFieldId("my_nested_group", "my_group"),
  ).toBeVisible();
  await expect(
    pageTypesBuilderPage.getListItemFieldName(
      "my_nested_group",
      "My Nested Group",
      "my_group",
    ),
  ).toBeVisible();

  await expect(
    pageTypesBuilderPage.getListItemFieldId(
      "my_nested_group_sub_field",
      "my_nested_group",
    ),
  ).toBeVisible();
  await expect(
    pageTypesBuilderPage.getListItemFieldName(
      "my_nested_group_sub_field",
      "My Nested Group Sub Field",
      "my_nested_group",
    ),
  ).toBeVisible();
});

test("I can edit a nested group and its sub field inside a group field", async ({
  pageTypesBuilderPage,
  procedures,
  reusablePageType,
}) => {
  procedures.mock(
    "telemetry.getExperimentVariant",
    ({ args }) =>
      args[0] === "slicemachine-nested-groups" ? { value: "on" } : undefined,
    { execute: false },
  );

  await pageTypesBuilderPage.goto(reusablePageType.name);
  await pageTypesBuilderPage.addStaticField({
    type: "Repeatable Group",
    name: "My Group",
    expectedId: "my_group",
  });
  await pageTypesBuilderPage.addStaticField({
    type: "Repeatable Group",
    name: "My Nested Group",
    expectedId: "my_nested_group",
    groupFieldId: "my_group",
  });
  await pageTypesBuilderPage.addStaticField({
    type: "Rich Text",
    name: "My Nested Group Sub Field",
    expectedId: "my_nested_group_sub_field",
    groupFieldId: "my_nested_group",
    grandparentGroupFieldId: "my_group",
  });

  await pageTypesBuilderPage
    .getEditFieldButton("my_nested_group_sub_field", "my_nested_group")
    .click();
  await pageTypesBuilderPage.editFieldDialog.editField({
    name: "My Nested Group Sub Field",
    newName: "My Nested Group Sub Field Renamed",
    newId: "my_nested_group_sub_field_renamed",
  });

  await pageTypesBuilderPage
    .getEditFieldButton("my_nested_group", "my_group")
    .first()
    .click();
  await pageTypesBuilderPage.editFieldDialog.editField({
    name: "My Nested Group",
    newName: "My Nested Group Renamed",
    newId: "my_nested_group_renamed",
  });

  await expect(
    pageTypesBuilderPage.getListItemFieldId(
      "my_nested_group_renamed",
      "my_group",
    ),
  ).toBeVisible();
  await expect(
    pageTypesBuilderPage.getListItemFieldName(
      "my_nested_group_renamed",
      "My Nested Group Renamed",
      "my_group",
    ),
  ).toBeVisible();

  await expect(
    pageTypesBuilderPage.getListItemFieldId(
      "my_nested_group_sub_field_renamed",
      "my_nested_group_renamed",
    ),
  ).toBeVisible();
  await expect(
    pageTypesBuilderPage.getListItemFieldName(
      "my_nested_group_sub_field_renamed",
      "My Nested Group Sub Field Renamed",
      "my_nested_group_renamed",
    ),
  ).toBeVisible();
});

test("I can delete a nested group and its sub field inside a group field", async ({
  pageTypesBuilderPage,
  procedures,
  reusablePageType,
}) => {
  procedures.mock(
    "telemetry.getExperimentVariant",
    ({ args }) =>
      args[0] === "slicemachine-nested-groups" ? { value: "on" } : undefined,
    { execute: false },
  );

  await pageTypesBuilderPage.goto(reusablePageType.name);
  await pageTypesBuilderPage.addStaticField({
    type: "Repeatable Group",
    name: "My Group",
    expectedId: "my_group",
  });
  await pageTypesBuilderPage.addStaticField({
    type: "Repeatable Group",
    name: "My Nested Group",
    expectedId: "my_nested_group",
    groupFieldId: "my_group",
  });
  await pageTypesBuilderPage.addStaticField({
    type: "Rich Text",
    name: "My Nested Group Sub Field",
    expectedId: "my_nested_group_sub_field",
    groupFieldId: "my_nested_group",
    grandparentGroupFieldId: "my_group",
  });

  await pageTypesBuilderPage.deleteField(
    "my_nested_group_sub_field",
    "my_nested_group",
  );

  await expect(
    pageTypesBuilderPage.getListItemFieldId(
      "my_nested_group_sub_field",
      "my_nested_group",
    ),
  ).not.toBeVisible();

  await pageTypesBuilderPage.deleteField("my_nested_group", "my_group");

  await expect(
    pageTypesBuilderPage.getListItemFieldId("my_nested_group", "my_group"),
  ).not.toBeVisible();
});

test("I can't add a nested group if I'm not eligible for the `slicemachine-nested-groups` experiment", async ({
  pageTypesBuilderPage,
  procedures,
  reusablePageType,
}) => {
  procedures.mock(
    "telemetry.getExperimentVariant",
    ({ args }) =>
      args[0] === "slicemachine-nested-groups" ? { value: "off" } : undefined,
    { execute: false },
  );

  await pageTypesBuilderPage.goto(reusablePageType.name);
  await pageTypesBuilderPage.addStaticField({
    type: "Repeatable Group",
    name: "My Group",
    expectedId: "my_group",
  });
  await pageTypesBuilderPage
    .getListItem("my_group")
    .getByTestId("add-field")
    .click();

  await expect(pageTypesBuilderPage.addFieldDropdown.menu).toBeVisible();
  const richTextField =
    pageTypesBuilderPage.addFieldDropdown.getField("Rich Text");
  await expect(richTextField).toBeVisible();
  const groupField =
    pageTypesBuilderPage.addFieldDropdown.getField("Repeatable Group");
  await expect(groupField).not.toBeVisible();
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
    type: "Repeatable Group",
    name: "My Group",
    expectedId: "my_group",
  });

  await expect(pageTypesBuilderPage.codeSnippetsFieldSwitch).not.toBeChecked();
  await pageTypesBuilderPage.codeSnippetsFieldSwitch.click();
  await expect(pageTypesBuilderPage.codeSnippetsFieldSwitch).toBeChecked();
  await pageTypesBuilderPage.copyCodeSnippet("my_group");
});

test("I can see and copy the code snippets for nested groups and their sub fields", async ({
  pageTypesBuilderPage,
  procedures,
  reusablePageType,
}) => {
  procedures.mock(
    "telemetry.getExperimentVariant",
    ({ args }) =>
      args[0] === "slicemachine-nested-groups" ? { value: "on" } : undefined,
    { execute: false },
  );

  await pageTypesBuilderPage.goto(reusablePageType.name);
  await pageTypesBuilderPage.addStaticField({
    type: "Repeatable Group",
    name: "My Group",
    expectedId: "my_group",
  });
  await pageTypesBuilderPage.addStaticField({
    type: "Repeatable Group",
    name: "My Nested Group",
    expectedId: "my_nested_group",
    groupFieldId: "my_group",
  });
  await pageTypesBuilderPage.addStaticField({
    type: "Rich Text",
    name: "My Nested Group Sub Field",
    expectedId: "my_nested_group_sub_field",
    groupFieldId: "my_nested_group",
    grandparentGroupFieldId: "my_group",
  });

  await expect(pageTypesBuilderPage.codeSnippetsFieldSwitch).not.toBeChecked();
  await pageTypesBuilderPage.codeSnippetsFieldSwitch.click();
  await expect(pageTypesBuilderPage.codeSnippetsFieldSwitch).toBeChecked();
  await pageTypesBuilderPage.copyCodeSnippet("my_nested_group", "my_group");
  await pageTypesBuilderPage.copyCodeSnippet(
    "my_nested_group_sub_field",
    "my_nested_group",
  );
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

test("I cannot see default UID field in Static zone for reusable page type", async ({
  pageTypesBuilderPage,
  reusablePageType,
}) => {
  await pageTypesBuilderPage.goto(reusablePageType.name);

  await expect(
    pageTypesBuilderPage.getListItemFieldId("uid"),
  ).not.toBeVisible();
});

test("I can edit the UID field for reusable page", async ({
  pageTypesBuilderPage,
  reusablePageType,
}) => {
  await pageTypesBuilderPage.goto(reusablePageType.name);

  await expect(
    pageTypesBuilderPage.uidEditor.getDialogTrigger("UID"),
  ).toBeVisible();

  await pageTypesBuilderPage.uidEditor.getDialogTrigger("UID").click();
  await pageTypesBuilderPage.uidEditor.editInput("my_uid");
  await pageTypesBuilderPage.uidEditor.submitInput();

  await expect(
    pageTypesBuilderPage.uidEditor.getDialogTrigger("my_uid"),
  ).toBeVisible();
});

test("I cannot edit the UID field with UIDEditor for single page", async ({
  pageTypesBuilderPage,
  singlePageType,
}) => {
  await pageTypesBuilderPage.goto(singlePageType.name);

  await expect(
    pageTypesBuilderPage.uidEditor.getDialogTrigger("UID"),
  ).not.toBeVisible();
});

test("I cannot save empty UID for reusable page", async ({
  pageTypesBuilderPage,
  reusablePageType,
}) => {
  await pageTypesBuilderPage.goto(reusablePageType.name);

  await expect(
    pageTypesBuilderPage.uidEditor.getDialogTrigger("UID"),
  ).toBeVisible();

  await pageTypesBuilderPage.uidEditor.getDialogTrigger("UID").click();
  await pageTypesBuilderPage.uidEditor.editInput("");
  await pageTypesBuilderPage.uidEditor.submitInput();

  await expect(
    pageTypesBuilderPage.uidEditor.getErrorMessage("This field is required"),
  ).toBeVisible();
});

test("I cannot save UID longer than 35 characters for reusable page", async ({
  pageTypesBuilderPage,
  reusablePageType,
}) => {
  await pageTypesBuilderPage.goto(reusablePageType.name);

  await expect(
    pageTypesBuilderPage.uidEditor.getDialogTrigger("UID"),
  ).toBeVisible();

  await pageTypesBuilderPage.uidEditor.getDialogTrigger("UID").click();
  await pageTypesBuilderPage.uidEditor.editInput(
    generateRandomString({ length: 36 }),
  );
  await pageTypesBuilderPage.uidEditor.submitInput();

  await expect(
    pageTypesBuilderPage.uidEditor.getErrorMessage(
      "The label can't be longer than 35 characters",
    ),
  ).toBeVisible();
});
