import { expect } from "@playwright/test";

import { test } from "../../fixtures";

test.describe("Navigation", () => {
  test("I can navigate through all menu entries", async ({
    page,
    pageTypesTablePage,
    customTypesTablePage,
    slicesListPage,
    changesPage,
    changelogPage,
  }) => {
    await page.goto("/");

    await pageTypesTablePage.menu.pageTypesLink.click();
    await expect(pageTypesTablePage.breadcrumbLabel).toBeVisible();
    expect(await page.title()).toContain("Page types - Slice Machine");

    await customTypesTablePage.menu.customTypesLink.click();
    await expect(customTypesTablePage.breadcrumbLabel).toBeVisible();
    expect(await page.title()).toContain("Custom types - Slice Machine");

    await slicesListPage.menu.slicesLink.click();
    await expect(slicesListPage.breadcrumbLabel).toBeVisible();
    expect(await page.title()).toContain("Slices - Slice Machine");

    await changesPage.menu.changesLink.click();
    await expect(changesPage.breadcrumbLabel).toBeVisible();
    expect(await page.title()).toContain("Changes - Slice Machine");

    await changelogPage.menu.changelogLink.click();
    await expect(changelogPage.breadcrumbLabel).toBeVisible();
    expect(await page.title()).toContain("Changelog - Slice Machine");
  });

  test("I access the changelog from Slice Machine version", async ({
    pageTypesTablePage,
    changelogPage,
  }) => {
    await pageTypesTablePage.goto();
    await expect(pageTypesTablePage.menu.appVersion).toBeVisible();
    await pageTypesTablePage.menu.appVersion.click();

    await expect(changelogPage.breadcrumbLabel).toBeVisible();
  });
});
