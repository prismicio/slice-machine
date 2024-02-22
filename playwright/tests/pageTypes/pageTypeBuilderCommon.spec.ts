import { expect } from "@playwright/test";

import { test } from "../../fixtures";

test("I can add a tab", async ({ pageTypesBuilderPage, reusablePageType }) => {
  await pageTypesBuilderPage.goto(reusablePageType.name);
  await pageTypesBuilderPage.addTabButton.click();
  await pageTypesBuilderPage.addTabDialog.createTab("New tab");

  await pageTypesBuilderPage.checkIfTabIsActive("New tab");
});

test("I can open another tab", async ({
  pageTypesBuilderPage,
  reusablePageType,
}) => {
  await pageTypesBuilderPage.goto(reusablePageType.name);
  await pageTypesBuilderPage.addTabButton.click();
  await pageTypesBuilderPage.addTabDialog.createTab("New tab");
  await pageTypesBuilderPage.openTab("Main");

  await pageTypesBuilderPage.checkIfTabIsActive("Main");
});

test("I can rename the active tab", async ({
  pageTypesBuilderPage,
  reusablePageType,
}) => {
  await pageTypesBuilderPage.goto(reusablePageType.name);
  await pageTypesBuilderPage.addTabButton.click();
  await pageTypesBuilderPage.addTabDialog.createTab("New tab");
  await pageTypesBuilderPage.getTabMenuButton("New tab").click();
  await pageTypesBuilderPage.renameTabButton.click();
  await pageTypesBuilderPage.renameTabDialog.renameTab(
    "New tab",
    "Renamed tab",
  );

  await pageTypesBuilderPage.checkIfTabIsActive("Renamed tab");
});

test("I can rename another tab", async ({
  pageTypesBuilderPage,
  reusablePageType,
}) => {
  await pageTypesBuilderPage.goto(reusablePageType.name);
  await pageTypesBuilderPage.addTabButton.click();
  await pageTypesBuilderPage.addTabDialog.createTab("New tab");
  await pageTypesBuilderPage.openTab("Main");
  await pageTypesBuilderPage.getTab("New tab").hover();
  await pageTypesBuilderPage.getTabMenuButton("New tab").click();
  await pageTypesBuilderPage.renameTabButton.click();
  await pageTypesBuilderPage.renameTabDialog.renameTab(
    "New tab",
    "Renamed tab",
  );

  await expect(pageTypesBuilderPage.getTab("Renamed tab")).toBeVisible();
});

test("I can delete the current tab", async ({
  pageTypesBuilderPage,
  reusablePageType,
}) => {
  await pageTypesBuilderPage.goto(reusablePageType.name);
  await pageTypesBuilderPage.addTabButton.click();
  await pageTypesBuilderPage.addTabDialog.createTab("New tab");
  await pageTypesBuilderPage.getTabMenuButton("New tab").click();
  await pageTypesBuilderPage.deleteTabButton.click();
  await pageTypesBuilderPage.deleteTabDialog.deleteTab();

  await pageTypesBuilderPage.checkIfTabIsActive("Main");
  await expect(pageTypesBuilderPage.getTab("New tab")).not.toBeVisible();
});

test("I can delete another tab", async ({
  pageTypesBuilderPage,
  reusablePageType,
}) => {
  await pageTypesBuilderPage.goto(reusablePageType.name);
  await pageTypesBuilderPage.addTabButton.click();
  await pageTypesBuilderPage.addTabDialog.createTab("New tab");
  await pageTypesBuilderPage.openTab("Main");
  await pageTypesBuilderPage.getTab("New tab").hover();
  await pageTypesBuilderPage.getTabMenuButton("New tab").click();
  await pageTypesBuilderPage.deleteTabButton.click();
  await pageTypesBuilderPage.deleteTabDialog.deleteTab();

  await pageTypesBuilderPage.checkIfTabIsActive("Main");
  await expect(pageTypesBuilderPage.getTab("New tab")).not.toBeVisible();
});

test("I cannot delete the last tab", async ({
  pageTypesBuilderPage,
  reusablePageType,
}) => {
  await pageTypesBuilderPage.goto(reusablePageType.name);
  await pageTypesBuilderPage.getTab("SEO & Metadata").hover();
  await pageTypesBuilderPage.getTabMenuButton("SEO & Metadata").click();
  await pageTypesBuilderPage.deleteTabButton.click();
  await pageTypesBuilderPage.deleteTabDialog.deleteTab();
  await pageTypesBuilderPage.getTabMenuButton("Main").click();
  await expect(pageTypesBuilderPage.deleteTabButton).toBeDisabled();
});

test("I can see my changes auto-saved", async ({
  pageTypesBuilderPage,
  reusablePageType,
}) => {
  await pageTypesBuilderPage.goto(reusablePageType.name);
  await pageTypesBuilderPage.addStaticField({
    type: "Rich Text",
    name: "My Rich Text",
    expectedId: "my_rich_text",
  });

  await expect(pageTypesBuilderPage.autoSaveStatusSaved).toBeVisible();
  await pageTypesBuilderPage.page.reload();
  await expect(pageTypesBuilderPage.autoSaveStatusSaved).toBeVisible();
});

test("I can see my changes being saved", async ({
  pageTypesBuilderPage,
  reusablePageType,
  procedures,
}) => {
  procedures.mock("customTypes.updateCustomType", ({ data }) => data, {
    delay: 2000,
  });

  await pageTypesBuilderPage.goto(reusablePageType.name);
  await pageTypesBuilderPage.addStaticField({
    type: "Rich Text",
    name: "My Rich Text",
    expectedId: "my_rich_text",
  });

  await expect(pageTypesBuilderPage.autoSaveStatusSaving).toBeVisible();
  await expect(pageTypesBuilderPage.autoSaveStatusSaved).toBeVisible();
  await pageTypesBuilderPage.page.reload();
  await expect(pageTypesBuilderPage.autoSaveStatusSaved).toBeVisible();
});

test("I can see that my changes failed to save and I can retry", async ({
  pageTypesBuilderPage,
  reusablePageType,
  procedures,
}) => {
  procedures.mock("customTypes.updateCustomType", () => ({ errors: [{}] }), {
    execute: false,
    times: 1,
  });

  await pageTypesBuilderPage.goto(reusablePageType.name);
  await pageTypesBuilderPage.addStaticField({
    type: "Rich Text",
    name: "My Rich Text",
    expectedId: "my_rich_text",
  });

  await expect(pageTypesBuilderPage.autoSaveStatusError).toBeVisible();
  await pageTypesBuilderPage.autoSaveRetryButton.click();
  await expect(pageTypesBuilderPage.autoSaveStatusSaving).toBeVisible();
  await expect(pageTypesBuilderPage.autoSaveStatusSaved).toBeVisible();
  await pageTypesBuilderPage.page.reload();
  await expect(pageTypesBuilderPage.autoSaveStatusSaved).toBeVisible();
});

test("I cannot see a save happening when I first load the page", async ({
  pageTypesBuilderPage,
  reusablePageType,
  procedures,
}) => {
  procedures.mock("customTypes.updateCustomType", ({ data }) => data, {
    delay: 2000,
  });

  await pageTypesBuilderPage.goto(reusablePageType.name);
  await expect(pageTypesBuilderPage.autoSaveStatusSaving).not.toBeVisible({
    // As soon as it's visible it's a problem
    timeout: 1,
  });
});

test("I can rename the custom type", async ({
  pageTypesBuilderPage,
  reusablePageType,
}) => {
  await pageTypesBuilderPage.goto(reusablePageType.name);
  await pageTypesBuilderPage.openActionMenu("Rename");
  const newPageTypeName = `${reusablePageType.name}Renamed`;
  await pageTypesBuilderPage.renameTypeDialog.renameType(
    newPageTypeName,
    "builder",
  );

  await expect(
    pageTypesBuilderPage.getBreadcrumbLabel(newPageTypeName),
  ).toBeVisible();
});

test("I can delete the custom type", async ({
  pageTypesBuilderPage,
  reusablePageType,
  pageTypesTablePage,
}) => {
  await pageTypesBuilderPage.goto(reusablePageType.name);
  await pageTypesBuilderPage.openActionMenu("Remove");
  await pageTypesBuilderPage.deleteTypeDialog.deleteType();

  await expect(pageTypesTablePage.breadcrumbLabel).toBeVisible();
  await expect(
    pageTypesTablePage.getRow(reusablePageType.name),
  ).not.toBeVisible();
});

test("I can see the page code snippet and copy the content", async ({
  pageTypesBuilderPage,
  reusablePageType,
}) => {
  await pageTypesBuilderPage.goto(reusablePageType.name);
  await pageTypesBuilderPage.pageSnippetButton.click();
  await pageTypesBuilderPage.pageSnippetDialog.copyPageSnippet();
});
