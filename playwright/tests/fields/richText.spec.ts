import { expect } from "@playwright/test";

import { test } from "../../fixtures";

test("I can create a rich text field that allows multiple paragraphs by default", async ({
  customTypesBuilderPage,
  singleCustomType,
}) => {
  await customTypesBuilderPage.goto(singleCustomType.name);
  await customTypesBuilderPage.addStaticField({
    type: "Rich Text",
    name: "My Rich Text",
    expectedId: "my_rich_text",
  });
  await customTypesBuilderPage.getEditFieldButton("my_rich_text").click();

  await expect(
    customTypesBuilderPage.editFieldDialog.getFieldByLabel(
      "Allow multiple paragraphs",
    ),
  ).toHaveValue("on");
});
