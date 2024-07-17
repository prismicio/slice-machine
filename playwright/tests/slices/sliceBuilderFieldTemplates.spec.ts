import { expect } from "@playwright/test";

import { test } from "../../fixtures";

test("I can add a simple group field template in the static zone", async ({
  sliceBuilderPage,
  slice,
}) => {
  await sliceBuilderPage.goto(slice.name);

  await expect(sliceBuilderPage.staticZoneListItem).toHaveCount(0);

  await sliceBuilderPage.addField({
    type: "Simple group",
    name: "My simple group template",
    expectedId: "my_simple_group_template",
    zoneType: "static",
  });

  await expect(sliceBuilderPage.staticZoneListItem).toHaveCount(3);

  // 1st field of the template
  await expect(
    sliceBuilderPage.getListItemFieldId(
      "text",
      "static",
      "my_simple_group_template",
    ),
  ).toBeVisible();
  await expect(
    sliceBuilderPage.getListItemFieldName(
      "text",
      "A Text",
      "static",
      "my_simple_group_template",
    ),
  ).toBeVisible();

  // 2nd field of the template
  await expect(
    sliceBuilderPage.getListItemFieldId(
      "image",
      "static",
      "my_simple_group_template",
    ),
  ).toBeVisible();
  await expect(
    sliceBuilderPage.getListItemFieldName(
      "image",
      "An image",
      "static",
      "my_simple_group_template",
    ),
  ).toBeVisible();
});

test("I can add an advanced group field template in the static zone", async ({
  sliceBuilderPage,
  slice,
}) => {
  await sliceBuilderPage.goto(slice.name);

  await expect(sliceBuilderPage.staticZoneListItem).toHaveCount(0);

  await sliceBuilderPage.addField({
    type: "Advanced group",
    name: "My advanced group template",
    expectedId: "my_advanced_group_template",
    zoneType: "static",
  });

  await expect(sliceBuilderPage.staticZoneListItem).toHaveCount(4);

  // 1st field of the template
  await expect(
    sliceBuilderPage.getListItemFieldId(
      "nestedGroup",
      "static",
      "my_advanced_group_template",
    ),
  ).toBeVisible();
  await expect(
    sliceBuilderPage.getListItemFieldName(
      "nestedGroup",
      "A nested Group",
      "static",
      "my_advanced_group_template",
    ),
  ).toBeVisible();

  // 1st field of the nested group
  await expect(
    sliceBuilderPage.getListItemFieldId("nestedText", "static", "nestedGroup"),
  ).toBeVisible();
  await expect(
    sliceBuilderPage.getListItemFieldName(
      "nestedText",
      "A text",
      "static",
      "nestedGroup",
    ),
  ).toBeVisible();

  // 2nd field of the nested group
  await expect(
    sliceBuilderPage.getListItemFieldId("nestedImage", "static", "nestedGroup"),
  ).toBeVisible();
  await expect(
    sliceBuilderPage.getListItemFieldName(
      "nestedImage",
      "An image",
      "static",
      "nestedGroup",
    ),
  ).toBeVisible();
});
