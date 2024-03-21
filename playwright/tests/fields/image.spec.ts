import { expect } from "@playwright/test";

import { test } from "../../fixtures";

test("I can create an image field that doesn't allow captions by default", async ({
  customTypesBuilderPage,
  singleCustomType,
}) => {
  await customTypesBuilderPage.goto(singleCustomType.name);
  await customTypesBuilderPage.addStaticField({
    type: "Image",
    name: "My Image",
    expectedId: "my_image",
  });
  await customTypesBuilderPage.getEditFieldButton("my_image").click();

  await expect(
    customTypesBuilderPage.editFieldDialog.getFieldByLabel("Allow caption"),
  ).toHaveValue("false");
});

test("I can enable captions", async ({
  customTypesBuilderPage,
  singleCustomType,
}) => {
  const name = "My Image";
  const id = "my_image";

  await customTypesBuilderPage.goto(singleCustomType.name);
  await customTypesBuilderPage.addStaticField({
    type: "Image",
    name,
    expectedId: id,
  });
  await customTypesBuilderPage.getEditFieldButton(id).click();

  await customTypesBuilderPage.editFieldDialog
    .getFieldByLabel("Allow caption")
    .setChecked(true);
  await customTypesBuilderPage.editFieldDialog.submitButton.click();
  await expect(
    customTypesBuilderPage.editFieldDialog.getTitle(name),
  ).not.toBeVisible();

  await customTypesBuilderPage.getEditFieldButton(id).click();
  await expect(
    customTypesBuilderPage.editFieldDialog.getFieldByLabel("Allow caption"),
  ).toHaveValue("true");
});
