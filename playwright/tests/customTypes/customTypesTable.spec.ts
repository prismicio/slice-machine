import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import { generateRandomId } from "../../utils/generateRandomId";

test("I can create a reusable custom type", async ({
  customTypesTablePage,
  customTypesBuilderPage,
}) => {
  await customTypesTablePage.goto();
  await customTypesTablePage.openCreateDialog();

  const name = "Custom Type " + generateRandomId();
  await customTypesTablePage.createTypeDialog.createType(name, "reusable");

  await expect(customTypesBuilderPage.getBreadcrumbLabel(name)).toBeVisible();

  await expect(customTypesBuilderPage.tab).toHaveCount(1);
  await expect(customTypesBuilderPage.getTab("Main")).toBeVisible();

  await expect(customTypesBuilderPage.staticZoneListItem).toHaveCount(1);
  await expect(customTypesBuilderPage.getListItemFieldId("uid")).toBeVisible();
  await expect(
    customTypesBuilderPage.getListItemFieldName("uid", "UID"),
  ).toBeVisible();

  await expect(customTypesBuilderPage.sliceZoneSwitch).not.toBeChecked();
});

test("I can create a single custom type", async ({
  customTypesTablePage,
  customTypesBuilderPage,
}) => {
  await customTypesTablePage.goto();
  await customTypesTablePage.openCreateDialog();

  const name = "Custom Type " + generateRandomId();
  await customTypesTablePage.createTypeDialog.createType(name, "single");

  await expect(customTypesBuilderPage.getBreadcrumbLabel(name)).toBeVisible();

  await expect(customTypesBuilderPage.tab).toHaveCount(1);
  await expect(customTypesBuilderPage.getTab("Main")).toBeVisible();

  await expect(customTypesBuilderPage.staticZoneListItem).toHaveCount(0);

  await expect(customTypesBuilderPage.sliceZoneSwitch).not.toBeChecked();
});

test("I cannot create a custom type with a name or id already used", async ({
  customTypesTablePage,
  reusableCustomType,
}) => {
  await customTypesTablePage.goto();
  await customTypesTablePage.openCreateDialog();

  await expect(customTypesTablePage.createTypeDialog.title).toBeVisible();
  await customTypesTablePage.createTypeDialog.nameInput.fill(
    reusableCustomType.name,
  );
  await expect(
    customTypesTablePage.createTypeDialog.submitButton,
  ).toBeDisabled();
});

test("I can rename a custom type", async ({
  reusableCustomType,
  customTypesTablePage,
}) => {
  await customTypesTablePage.goto();
  await customTypesTablePage.openActionMenu(reusableCustomType.name, "Rename");

  const newCustomTypeName = `${reusableCustomType.name}Renamed`;
  await customTypesTablePage.renameTypeDialog.renameType(newCustomTypeName);

  // TODO(DT-1802): Production BUG - Sometimes after a rename, old custom type name is still visible in the list
  await customTypesTablePage.page.reload();

  await expect(customTypesTablePage.getRow(newCustomTypeName)).toBeVisible();
});
