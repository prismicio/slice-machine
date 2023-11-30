import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import { generateRandomId } from "../../utils/generateRandomId";

test.describe("Custom Types", () => {
  test("I can create a custom type", async ({
    customTypesTablePage,
    customTypesBuilderPage,
  }) => {
    await customTypesTablePage.goto();
    await customTypesTablePage.openCreateDialog();

    const name = "Custom Type " + generateRandomId();
    await customTypesTablePage.createTypeDialog.createType(name);
    await customTypesBuilderPage.checkSavedMessage();

    // TODO(DT-1801): Production BUG - When creating a custom type, don't redirect
    // to the builder page until the custom  type is created
    await customTypesBuilderPage.goto(name);

    await expect(
      customTypesBuilderPage.breadcrumb.getByText(name),
    ).toBeVisible();

    await expect(customTypesBuilderPage.staticZoneListItem).toHaveCount(1);
  });

  test("I can rename a custom type", async ({
    customType,
    customTypesTablePage,
  }) => {
    await customTypesTablePage.goto();
    await customTypesTablePage.openActionDialog(customType.name, "Rename");

    const newCustomTypeName = `${customType.name}Renamed`;
    await customTypesTablePage.renameTypeDialog.renameType(newCustomTypeName);
    await customTypesTablePage.renameTypeDialog.checkRenamedMessage();

    // TODO(DT-1802): Production BUG - Sometimes after a rename, old custom type name is still visible in the list
    await customTypesTablePage.page.reload();

    await expect(customTypesTablePage.getRow(newCustomTypeName)).toBeVisible();
  });
});
