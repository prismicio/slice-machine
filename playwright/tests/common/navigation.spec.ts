import { expect } from "@playwright/test";

import { test } from "../../fixtures";

test.describe("Navigation", () => {
  test("I can navigate through all menu entries", async ({
    page,
    pageTypesTablePage,
    customTypesTablePage,
    sliceTablePage,
    changesPage,
    changelogPage,
  }) => {
    await page.goto("/");

    await pageTypesTablePage.menu.pageTypesLink.click();
    await expect(pageTypesTablePage.title).toBeVisible();
    expect(await page.title()).toContain("Page types - Slice Machine");

    await customTypesTablePage.menu.customTypesLink.click();
    await expect(customTypesTablePage.title).toBeVisible();
    expect(await page.title()).toContain("Custom types - Slice Machine");

    await sliceTablePage.menu.slicesLink.click();
    await expect(sliceTablePage.title).toBeVisible();
    expect(await page.title()).toContain("Slices - Slice Machine");

    await changesPage.menu.changesLink.click();
    await expect(changesPage.title).toBeVisible();
    expect(await page.title()).toContain("Changes - Slice Machine");

    await changelogPage.menu.changelogLink.click();
    await expect(changelogPage.title).toBeVisible();
    expect(await page.title()).toContain("Changelog - Slice Machine");
  });
});