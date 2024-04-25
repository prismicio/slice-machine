import { expect } from "@playwright/test";

import { test } from "../../fixtures";

test("I can add a rich text field in the static zone", async ({
  sliceBuilderPage,
  slice,
}) => {
  await sliceBuilderPage.goto(slice.name);

  await expect(sliceBuilderPage.staticZoneListItem).toHaveCount(0);

  await sliceBuilderPage.addField({
    type: "Rich Text",
    name: "My Rich Text",
    expectedId: "my_rich_text",
    zoneType: "static",
  });

  await expect(sliceBuilderPage.staticZoneListItem).toHaveCount(1);
});

test("I can edit a rich text field in the static zone", async ({
  sliceBuilderPage,
  slice,
}) => {
  await sliceBuilderPage.goto(slice.name);
  await sliceBuilderPage.addField({
    type: "Rich Text",
    name: "My Rich Text",
    expectedId: "my_rich_text",
    zoneType: "static",
  });

  await sliceBuilderPage.getEditFieldButton("my_rich_text", "static").click();
  await sliceBuilderPage.editFieldDialog.editField({
    name: "My Rich Text",
    newName: "My Rich Text Renamed",
    newId: "my_rich_text_renamed",
  });

  await expect(
    sliceBuilderPage.getListItemFieldId("my_rich_text_renamed", "static"),
  ).toBeVisible();
  await expect(
    sliceBuilderPage.getListItemFieldName(
      "my_rich_text_renamed",
      "My Rich Text Renamed",
      "static",
    ),
  ).toBeVisible();
});

test("I can add a group field in the static zone", async ({
  sliceBuilderPage,
  slice,
  procedures,
}) => {
  procedures.mock(
    "telemetry.getExperimentVariant",
    ({ args }) =>
      args[0] === "slicemachine-groups-in-slices" ? { value: "on" } : undefined,
    { execute: false },
  );

  await sliceBuilderPage.goto(slice.name);

  await expect(sliceBuilderPage.staticZoneListItem).toHaveCount(0);

  await sliceBuilderPage.addField({
    type: "Group",
    name: "My Group",
    expectedId: "my_group",
    zoneType: "static",
  });

  await expect(sliceBuilderPage.staticZoneListItem).toHaveCount(1);
});

test("I can add a sub field within a group field", async ({
  sliceBuilderPage,
  slice,
  procedures,
}) => {
  procedures.mock(
    "telemetry.getExperimentVariant",
    ({ args }) =>
      args[0] === "slicemachine-groups-in-slices" ? { value: "on" } : undefined,
    { execute: false },
  );

  await sliceBuilderPage.goto(slice.name);
  await sliceBuilderPage.addField({
    type: "Group",
    name: "My Group",
    expectedId: "my_group",
    zoneType: "static",
  });
  await sliceBuilderPage.addField({
    type: "Rich Text",
    name: "My Sub Field",
    expectedId: "my_sub_field",
    zoneType: "static",
    groupFieldId: "my_group",
  });

  await expect(
    sliceBuilderPage.getListItemFieldId("my_sub_field", "static", "my_group"),
  ).toBeVisible();
  await expect(
    sliceBuilderPage.getListItemFieldName(
      "my_sub_field",
      "My Sub Field",
      "static",
      "my_group",
    ),
  ).toBeVisible();
});

test("I can edit a sub field within a group field", async ({
  sliceBuilderPage,
  slice,
  procedures,
}) => {
  procedures.mock(
    "telemetry.getExperimentVariant",
    ({ args }) =>
      args[0] === "slicemachine-groups-in-slices" ? { value: "on" } : undefined,
    { execute: false },
  );

  await sliceBuilderPage.goto(slice.name);
  await sliceBuilderPage.addField({
    type: "Group",
    name: "My Group",
    expectedId: "my_group",
    zoneType: "static",
  });
  await sliceBuilderPage.addField({
    type: "Rich Text",
    name: "My Sub Field",
    expectedId: "my_sub_field",
    zoneType: "static",
    groupFieldId: "my_group",
  });

  await sliceBuilderPage
    .getEditFieldButton("my_sub_field", "static", "my_group")
    .click();
  await sliceBuilderPage.editFieldDialog.editField({
    name: "My Sub Field",
    newName: "My Sub Field Renamed",
    newId: "my_sub_field_renamed",
  });

  await expect(
    sliceBuilderPage.getListItemFieldId(
      "my_sub_field_renamed",
      "static",
      "my_group",
    ),
  ).toBeVisible();
  await expect(
    sliceBuilderPage.getListItemFieldName(
      "my_sub_field_renamed",
      "My Sub Field Renamed",
      "static",
      "my_group",
    ),
  ).toBeVisible();
});

test("I can delete a sub field within a group field", async ({
  sliceBuilderPage,
  slice,
  procedures,
}) => {
  procedures.mock(
    "telemetry.getExperimentVariant",
    ({ args }) =>
      args[0] === "slicemachine-groups-in-slices" ? { value: "on" } : undefined,
    { execute: false },
  );

  await sliceBuilderPage.goto(slice.name);
  await sliceBuilderPage.addField({
    type: "Group",
    name: "My Group",
    expectedId: "my_group",
    zoneType: "static",
  });
  await sliceBuilderPage.addField({
    type: "Rich Text",
    name: "My Sub Field",
    expectedId: "my_sub_field",
    zoneType: "static",
    groupFieldId: "my_group",
  });

  await sliceBuilderPage.deleteField("my_sub_field", "static", "my_group");

  await expect(
    sliceBuilderPage.getListItemFieldId("my_sub_field", "static", "my_group"),
  ).not.toBeVisible();
});

test("I can delete a field in the static zone", async ({
  sliceBuilderPage,
  slice,
}) => {
  await sliceBuilderPage.goto(slice.name);
  await sliceBuilderPage.addField({
    type: "Rich Text",
    name: "My Rich Text",
    expectedId: "my_rich_text",
    zoneType: "static",
  });

  await sliceBuilderPage.deleteField("my_rich_text", "static");

  await expect(
    sliceBuilderPage.getListItemFieldId("my_rich_text", "static"),
  ).not.toBeVisible();
});

test("I can add a rich text field in the repeatable zone", async ({
  sliceBuilderPage,
  repeatableZoneSlice,
}) => {
  await sliceBuilderPage.goto(repeatableZoneSlice.name);

  await expect(sliceBuilderPage.repeatableZoneListItem).toHaveCount(1);

  await sliceBuilderPage.addField({
    type: "Rich Text",
    name: "My Rich Text",
    expectedId: "my_rich_text",
    zoneType: "repeatable",
  });

  await expect(sliceBuilderPage.repeatableZoneListItem).toHaveCount(2);
});

test("I can edit a rich text field in the repeatable zone", async ({
  sliceBuilderPage,
  repeatableZoneSlice,
}) => {
  await sliceBuilderPage.goto(repeatableZoneSlice.name);
  await sliceBuilderPage.addField({
    type: "Rich Text",
    name: "My Rich Text",
    expectedId: "my_rich_text",
    zoneType: "repeatable",
  });

  await sliceBuilderPage
    .getEditFieldButton("my_rich_text", "repeatable")
    .click();
  await sliceBuilderPage.editFieldDialog.editField({
    name: "My Rich Text",
    newName: "My Rich Text Renamed",
    newId: "my_rich_text_renamed",
  });

  await expect(
    sliceBuilderPage.getListItemFieldId("my_rich_text_renamed", "repeatable"),
  ).toBeVisible();
  await expect(
    sliceBuilderPage.getListItemFieldName(
      "my_rich_text_renamed",
      "My Rich Text Renamed",
      "repeatable",
    ),
  ).toBeVisible();
});

test("I can delete a field in the repeatable zone", async ({
  sliceBuilderPage,
  repeatableZoneSlice,
}) => {
  await sliceBuilderPage.goto(repeatableZoneSlice.name);
  await sliceBuilderPage.addField({
    type: "Rich Text",
    name: "My Rich Text",
    expectedId: "my_rich_text",
    zoneType: "repeatable",
  });

  await sliceBuilderPage.deleteField("my_rich_text", "repeatable");

  await expect(
    sliceBuilderPage.getListItemFieldId("my_rich_text", "repeatable"),
  ).not.toBeVisible();
});

test("I can delete the repeatable zone by deleting the zone's last field", async ({
  sliceBuilderPage,
  repeatableZoneSlice,
  procedures,
}) => {
  procedures.mock(
    "telemetry.getExperimentVariant",
    ({ args }) =>
      args[0] === "slicemachine-groups-in-slices" ? { value: "on" } : undefined,
    { execute: false },
  );

  await sliceBuilderPage.goto(repeatableZoneSlice.name);
  await sliceBuilderPage.deleteField("existing_field", "repeatable");
  await sliceBuilderPage.deleteRepeatableZoneDialog.deleteRepeatableZone();

  await expect(sliceBuilderPage.repeatableZone).not.toBeVisible();
});

test("I can see and copy the code snippets", async ({
  sliceBuilderPage,
  slice,
}) => {
  await sliceBuilderPage.goto(slice.name);
  await sliceBuilderPage.addField({
    type: "Rich Text",
    name: "My Rich Text",
    expectedId: "my_rich_text",
    zoneType: "static",
  });

  await expect(sliceBuilderPage.codeSnippetsFieldSwitch).not.toBeChecked();
  await sliceBuilderPage.codeSnippetsFieldSwitch.click();
  await expect(sliceBuilderPage.codeSnippetsFieldSwitch).toBeChecked();
  await sliceBuilderPage.copyCodeSnippet("my_rich_text", "static");
});

test("I can see and copy the code snippets for groups", async ({
  sliceBuilderPage,
  slice,
  procedures,
}) => {
  procedures.mock(
    "telemetry.getExperimentVariant",
    ({ args }) =>
      args[0] === "slicemachine-groups-in-slices" ? { value: "on" } : undefined,
    { execute: false },
  );

  await sliceBuilderPage.goto(slice.name);
  await sliceBuilderPage.addField({
    type: "Group",
    name: "My Group",
    expectedId: "my_group",
    zoneType: "static",
  });

  await expect(sliceBuilderPage.codeSnippetsFieldSwitch).not.toBeChecked();
  await sliceBuilderPage.codeSnippetsFieldSwitch.click();
  await expect(sliceBuilderPage.codeSnippetsFieldSwitch).toBeChecked();
  await sliceBuilderPage.copyCodeSnippet("my_group", "static");
});
