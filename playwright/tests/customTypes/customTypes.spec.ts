import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import { generateRandomId } from "../../utils/generateRandomId";

test.describe("Custom Types", () => {
  test("I can create a custom type", async ({
    customTypesTablePage,
    customTypesBuilderPage,
  }) => {
    await customTypesTablePage.goto();
    await customTypesTablePage.openCreateModal();

    const name = "Custom Type " + generateRandomId();
    await customTypesTablePage.createTypeModal.createType(name);
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
    await customTypesTablePage.openActionModal(customType.name, "Rename");

    const newCustomTypeName = `${customType.name}Renamed`;
    await customTypesTablePage.renameTypeModal.renameType(newCustomTypeName);
    await customTypesTablePage.renameTypeModal.checkRenamedMessage();

    // TODO(DT-1802): Production BUG - Sometimes after a rename, old custom type name is still visible in the list
    await customTypesTablePage.page.reload();

    await expect(customTypesTablePage.getRow(newCustomTypeName)).toBeVisible();
  });
});
