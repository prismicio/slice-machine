import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import { generateRandomId } from "../../utils/generateRandomId";

test("I can create a reusable page type", async ({
  pageTypesTablePage,
  pageTypesBuilderPage,
}) => {
  await pageTypesTablePage.goto();
  await pageTypesTablePage.openCreateDialog();

  const name = "Page Type " + generateRandomId();
  await pageTypesTablePage.createTypeDialog.createType(name, "reusable");

  await expect(pageTypesBuilderPage.sliceZoneBlankSlateTitle).toBeVisible();
  await pageTypesBuilderPage.sliceZoneBlankSlateUseTemplateAction.click();
  await pageTypesBuilderPage.useTemplateSlicesDialog.useTemplates([
    "Hero",
    "CustomerLogos",
  ]);
  await expect(pageTypesBuilderPage.sliceZoneBlankSlateTitle).not.toBeVisible();
  await expect(
    pageTypesBuilderPage.getSliceZoneSharedSliceCard("Hero"),
  ).toBeVisible();
  await expect(
    pageTypesBuilderPage.getSliceZoneSharedSliceCard("CustomerLogos"),
  ).toBeVisible();

  await pageTypesBuilderPage.checkBreadcrumb(name);

  await expect(pageTypesBuilderPage.tab).toHaveCount(2);
  await expect(pageTypesBuilderPage.getTab("Main")).toBeVisible();
  await expect(pageTypesBuilderPage.getTab("SEO & Metadata")).toBeVisible();

  await expect(
    pageTypesBuilderPage.uidEditor.getDialogTrigger("UID"),
  ).toBeVisible();

  await expect(pageTypesBuilderPage.sliceZoneSwitch).not.toBeVisible();
});

test("I can create a single page type", async ({
  pageTypesTablePage,
  pageTypesBuilderPage,
}) => {
  await pageTypesTablePage.goto();
  await pageTypesTablePage.openCreateDialog();

  const name = "Page Type " + generateRandomId();
  await pageTypesTablePage.createTypeDialog.createType(name, "single");

  await expect(pageTypesBuilderPage.sliceZoneBlankSlateTitle).toBeVisible();
  await pageTypesBuilderPage.sliceZoneBlankSlateUseTemplateAction.click();
  await pageTypesBuilderPage.useTemplateSlicesDialog.useTemplates([
    "AlternateGrid",
    "CallToAction",
  ]);
  await expect(pageTypesBuilderPage.sliceZoneBlankSlateTitle).not.toBeVisible();
  await expect(
    pageTypesBuilderPage.getSliceZoneSharedSliceCard("AlternateGrid"),
  ).toBeVisible();
  await expect(
    pageTypesBuilderPage.getSliceZoneSharedSliceCard("CallToAction"),
  ).toBeVisible();

  await pageTypesBuilderPage.checkBreadcrumb(name);

  await expect(pageTypesBuilderPage.tab).toHaveCount(2);
  await expect(pageTypesBuilderPage.getTab("Main")).toBeVisible();
  await expect(pageTypesBuilderPage.getTab("SEO & Metadata")).toBeVisible();

  await expect(pageTypesBuilderPage.staticZoneListItem).toHaveCount(0);

  await expect(pageTypesBuilderPage.sliceZoneSwitch).not.toBeVisible();
});

test("I cannot create a page type with a name or id already used", async ({
  pageTypesTablePage,
  reusablePageType,
}) => {
  await pageTypesTablePage.goto();
  await pageTypesTablePage.openCreateDialog();

  await expect(pageTypesTablePage.createTypeDialog.title).toBeVisible();
  await pageTypesTablePage.createTypeDialog.nameInput.fill(
    reusablePageType.name,
  );
  await expect(pageTypesTablePage.createTypeDialog.submitButton).toBeDisabled();
});

test("I cannot create a page type with a name update or insert", async ({
  pageTypesTablePage,
}) => {
  await pageTypesTablePage.goto();
  await pageTypesTablePage.openCreateDialog();

  await expect(pageTypesTablePage.createTypeDialog.title).toBeVisible();
  await pageTypesTablePage.createTypeDialog.nameInput.fill(
    "update",
  );
  await expect(pageTypesTablePage.createTypeDialog.submitButton).toBeDisabled();
  await pageTypesTablePage.createTypeDialog.nameInput.fill(
    "insert",
  );
  await expect(pageTypesTablePage.createTypeDialog.submitButton).toBeDisabled();
});

test("I can rename a page type", async ({
  pageTypesTablePage,
  reusablePageType,
}) => {
  await pageTypesTablePage.goto();
  await pageTypesTablePage.openActionMenu(reusablePageType.name, "Rename");

  const newPageTypeName = `${reusablePageType.name}Renamed`;
  await pageTypesTablePage.renameTypeDialog.renameType(newPageTypeName);

  // TODO(DT-1802): Production BUG - Sometimes after a rename, old page type name is still visible in the list
  await pageTypesTablePage.page.reload();

  await expect(pageTypesTablePage.getRow(newPageTypeName)).toBeVisible();
});

test("I can delete a page type", async ({
  pageTypesTablePage,
  reusablePageType,
}) => {
  await pageTypesTablePage.goto();
  await pageTypesTablePage.openActionMenu(reusablePageType.name, "Remove");

  await pageTypesTablePage.deleteTypeDialog.deleteType();

  await expect(
    pageTypesTablePage.getRow(reusablePageType.name),
  ).not.toBeVisible();
  await pageTypesTablePage.page.reload();
  await expect(
    pageTypesTablePage.getRow(reusablePageType.name),
  ).not.toBeVisible();
});

test("I can see the blank slate message when I don't have any page types", async ({
  pageTypesTablePage,
  procedures,
}) => {
  procedures.mock("getState", ({ data }) => ({
    ...(data as Record<string, unknown>),
    customTypes: [],
  }));
  await pageTypesTablePage.goto();

  await pageTypesTablePage.checkBlankSlateContainsText(
    "Page types are models that your editors will use to create website pages in the Page Builder.",
  );
  await expect(pageTypesTablePage.blankSlateCreateAction).toBeVisible();
});

test("I can create a new page type from the blank slate", async ({
  pageTypesTablePage,
  pageTypesBuilderPage,
  procedures,
}) => {
  procedures.mock("getState", ({ data }) => ({
    ...(data as Record<string, unknown>),
    customTypes: [],
  }));
  await pageTypesTablePage.goto();
  await pageTypesTablePage.blankSlateCreateAction.click();

  const name = "Page Type " + generateRandomId();
  await pageTypesTablePage.createTypeDialog.createType(name, "reusable");

  await pageTypesBuilderPage.checkBreadcrumb(name);
});
