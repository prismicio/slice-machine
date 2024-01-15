import { expect } from "@playwright/test";

import { test } from "../../fixtures";

test.run()(
  "I can add a rich text field in the static zone",
  async ({ sliceBuilderPage, slice }) => {
    await sliceBuilderPage.goto(slice.name);

    await expect(sliceBuilderPage.staticZoneListItem).toHaveCount(0);

    await sliceBuilderPage.addField({
      type: "Rich Text",
      name: "My Rich Text",
      expectedId: "my_rich_text",
      zoneType: "static",
    });

    await expect(sliceBuilderPage.staticZoneListItem).toHaveCount(1);
  },
);

test.run()(
  "I can edit a rich text field in the static zone",
  async ({ sliceBuilderPage, slice }) => {
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
  },
);

test.run()(
  "I can delete a field in the static zone",
  async ({ sliceBuilderPage, slice }) => {
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
  },
);

test.run()(
  "I can add a rich text field in the repeatable zone",
  async ({ sliceBuilderPage, slice }) => {
    await sliceBuilderPage.goto(slice.name);

    await expect(sliceBuilderPage.repeatableZoneListItem).toHaveCount(0);

    await sliceBuilderPage.addField({
      type: "Rich Text",
      name: "My Rich Text",
      expectedId: "my_rich_text",
      zoneType: "repeatable",
    });

    await expect(sliceBuilderPage.repeatableZoneListItem).toHaveCount(1);
  },
);

test.run()(
  "I can edit a rich text field in the repeatable zone",
  async ({ sliceBuilderPage, slice }) => {
    await sliceBuilderPage.goto(slice.name);
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
  },
);

test.run()(
  "I can delete a field in the repeatable zone",
  async ({ sliceBuilderPage, slice }) => {
    await sliceBuilderPage.goto(slice.name);
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
  },
);

test.run()(
  "I can see and copy the code snippets",
  async ({ sliceBuilderPage, slice }) => {
    await sliceBuilderPage.goto(slice.name);
    await sliceBuilderPage.addField({
      type: "Rich Text",
      name: "My Rich Text",
      expectedId: "my_rich_text",
      zoneType: "repeatable",
    });

    await expect(sliceBuilderPage.codeSnippetsFieldSwitch).not.toBeChecked();
    await sliceBuilderPage.codeSnippetsFieldSwitch.click();
    await expect(sliceBuilderPage.codeSnippetsFieldSwitch).toBeChecked();
    await sliceBuilderPage.copyCodeSnippet("my_rich_text", "repeatable");
  },
);
