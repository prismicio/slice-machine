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

test("I can delete a custom type", async ({
  customTypesTablePage,
  reusableCustomType,
}) => {
  await customTypesTablePage.goto();
  await customTypesTablePage.openActionMenu(reusableCustomType.name, "Remove");

  await customTypesTablePage.deleteTypeDialog.deleteType();

  await expect(
    customTypesTablePage.getRow(reusableCustomType.name),
  ).not.toBeVisible();
  await customTypesTablePage.page.reload();
  await expect(
    customTypesTablePage.getRow(reusableCustomType.name),
  ).not.toBeVisible();
});

test("I can convert a custom type to a page type", async ({
  customTypesTablePage,
  pageTypesTablePage,
  reusableCustomType,
}) => {
  await customTypesTablePage.goto();

  await customTypesTablePage.openActionMenu(
    reusableCustomType.name,
    "Convert to page type",
  );
  await expect(customTypesTablePage.convertedMessage).toBeVisible();

  await pageTypesTablePage.goto();
  await expect(
    pageTypesTablePage.getRow(reusableCustomType.name),
  ).toBeVisible();
});

test("I can see the blank slate message when I don't have any custom types", async ({
  customTypesTablePage,
  procedures,
}) => {
  procedures.mock("getState", ({ data }) => ({
    ...(data as Record<string, unknown>),
    customTypes: [],
  }));
  await customTypesTablePage.goto();

  await customTypesTablePage.checkBlankSlateContainsText(
    "Custom types are models that your editors can use to create menus or objects in the Page Builder.",
  );
  await expect(customTypesTablePage.blankSlateCreateAction).toBeVisible();
});

test("I can create a new custom type from the blank slate", async ({
  customTypesTablePage,
  customTypesBuilderPage,
  procedures,
}) => {
  procedures.mock("getState", ({ data }) => ({
    ...(data as Record<string, unknown>),
    customTypes: [],
  }));
  await customTypesTablePage.goto();
  await customTypesTablePage.blankSlateCreateAction.click();

  const name = "Custom Type " + generateRandomId();
  await customTypesTablePage.createTypeDialog.createType(name, "reusable");

  await expect(customTypesBuilderPage.getBreadcrumbLabel(name)).toBeVisible();
});
