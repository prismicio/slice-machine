import { expect } from "@playwright/test";

import { test } from "../../fixtures";

test("I can create a table field", async ({
  customTypesBuilderPage,
  procedures,
  singleCustomType,
}) => {
  procedures.mock(
    "telemetry.getExperimentVariant",
    ({ args }) =>
      args[0] === "slicemachine-table-field" ? { value: "on" } : undefined,
    { execute: false },
  );

  await customTypesBuilderPage.goto(singleCustomType.name);
  await customTypesBuilderPage.addStaticField({
    type: "Table",
    name: "My Table",
    expectedId: "my_table",
  });
  await customTypesBuilderPage.getEditFieldButton("my_table").click();

  await expect(
    customTypesBuilderPage.editFieldDialog.getFieldByLabel("Label"),
  ).toHaveValue("My Table");
});
