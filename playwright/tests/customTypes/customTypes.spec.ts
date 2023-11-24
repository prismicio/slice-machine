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

    // TODO(DT-1801): Production BUG - When creating a custom type, don't redirect
    // to the builder page until the custom type is created
    await customTypesBuilderPage.goto(name);

    await expect(
      customTypesBuilderPage.breadcrumb.getByText(name),
    ).toBeVisible();

    await expect(customTypesBuilderPage.staticZoneListItem).toHaveCount(1);

    await customTypesBuilderPage.menu.customTypesLink.click();

    await customTypesTablePage.openActionModal(name, "Rename");

    const newName = name + " - Edited";
    await customTypesTablePage.renameTypeModal.renameType(newName);

    // TODO(DT-1802): Production BUG - Sometimes after a rename, old custom type name is still visible in the list
    await customTypesTablePage.page.reload();

    await customTypesTablePage.getRow(newName).click();
    await expect(customTypesBuilderPage.breadcrumb).toContainText(newName);
  });
});
