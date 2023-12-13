import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import { generateRandomId } from "../../utils/generateRandomId";

test.describe("Custom types table", () => {
  test.run()(
    "I can create a reusable custom type",
    async ({ customTypesTablePage, customTypesBuilderPage }) => {
      await customTypesTablePage.goto();
      await customTypesTablePage.openCreateDialog();

      const name = "Custom Type " + generateRandomId();
      await customTypesTablePage.createTypeDialog.createType(name, "reusable");

      // TODO(DT-1801): Production BUG - When creating a custom type, don't redirect
      // to the builder page until the custom  type is created
      await customTypesBuilderPage.goto(name);

      await expect(
        customTypesBuilderPage.getBreadcrumbLabel(name),
      ).toBeVisible();

      await expect(customTypesBuilderPage.tab).toHaveCount(1);
      await expect(customTypesBuilderPage.getTab("Main")).toBeVisible();

      await expect(customTypesBuilderPage.staticZoneListItem).toHaveCount(1);
      await expect(
        customTypesBuilderPage.getStaticZoneListItemFieldName("UID"),
      ).toBeVisible();
      await expect(
        customTypesBuilderPage.getStaticZoneListItemFieldId("data.uid"),
      ).toBeVisible();

      await expect(customTypesBuilderPage.sliceZoneSwitch).not.toBeChecked();
    },
  );

  test.run()(
    "I can create a single custom type",
    async ({ customTypesTablePage, customTypesBuilderPage }) => {
      await customTypesTablePage.goto();
      await customTypesTablePage.openCreateDialog();

      const name = "Custom Type " + generateRandomId();
      await customTypesTablePage.createTypeDialog.createType(name, "single");

      // TODO(DT-1801): Production BUG - When creating a custom type, don't redirect
      // to the builder page until the custom  type is created
      await customTypesBuilderPage.goto(name);

      await expect(
        customTypesBuilderPage.getBreadcrumbLabel(name),
      ).toBeVisible();

      await expect(customTypesBuilderPage.tab).toHaveCount(1);
      await expect(customTypesBuilderPage.getTab("Main")).toBeVisible();

      await expect(customTypesBuilderPage.staticZoneListItem).toHaveCount(0);

      await expect(customTypesBuilderPage.sliceZoneSwitch).not.toBeChecked();
    },
  );

  test.run()(
    "I cannot create a custom type with a name or id already used",
    async ({ customTypesTablePage, reusableCustomType }) => {
      await customTypesTablePage.goto();
      await customTypesTablePage.openCreateDialog();

      await expect(customTypesTablePage.createTypeDialog.title).toBeVisible();
      await customTypesTablePage.createTypeDialog.nameInput.fill(
        reusableCustomType.name,
      );
      await expect(
        customTypesTablePage.createTypeDialog.submitButton,
      ).toBeDisabled();
    },
  );

  test.run()(
    "I can rename a custom type",
    async ({ reusableCustomType, customTypesTablePage }) => {
      await customTypesTablePage.goto();
      await customTypesTablePage.openActionMenu(
        reusableCustomType.name,
        "Rename",
      );

      const newCustomTypeName = `${reusableCustomType.name}Renamed`;
      await customTypesTablePage.renameTypeDialog.renameType(newCustomTypeName);

      // TODO(DT-1802): Production BUG - Sometimes after a rename, old custom type name is still visible in the list
      await customTypesTablePage.page.reload();

      await expect(
        customTypesTablePage.getRow(newCustomTypeName),
      ).toBeVisible();
    },
  );
});
