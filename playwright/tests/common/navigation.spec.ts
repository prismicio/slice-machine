import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import { experimentVariant } from "../../mocks";

test("I can navigate through all menu entries", async ({
  procedures,
  sliceMachinePage,
  pageTypesTablePage,
  customTypesTablePage,
  slicesListPage,
  changesPage,
  settingsPage,
  changelogPage,
}) => {
  procedures.mock("telemetry.getExperimentVariant", () => experimentVariant, {
    execute: false,
  });

  await sliceMachinePage.gotoDefaultPage();

  await pageTypesTablePage.menu.pageTypesLink.click();
  await expect(pageTypesTablePage.breadcrumbLabel).toBeVisible();
  expect(await sliceMachinePage.page.title()).toContain(
    "Page types - Slice Machine",
  );

  await customTypesTablePage.menu.customTypesLink.click();
  await expect(customTypesTablePage.breadcrumbLabel).toBeVisible();
  expect(await sliceMachinePage.page.title()).toContain(
    "Custom types - Slice Machine",
  );

  await slicesListPage.menu.slicesLink.click();
  await expect(slicesListPage.breadcrumbLabel).toBeVisible();
  expect(await sliceMachinePage.page.title()).toContain(
    "Slices - Slice Machine",
  );

  await changesPage.menu.changesLink.click();
  await expect(changesPage.breadcrumbLabel).toBeVisible();
  expect(await sliceMachinePage.page.title()).toContain(
    "Changes - Slice Machine",
  );

  await settingsPage.menu.settingsLink.click();
  await expect(settingsPage.breadcrumbLabel).toBeVisible();
  expect(await sliceMachinePage.page.title()).toContain(
    "Settings - Slice Machine",
  );

  await changelogPage.menu.changelogLink.click();
  await expect(changelogPage.breadcrumbLabel).toBeVisible();
  expect(await sliceMachinePage.page.title()).toContain(
    "Changelog - Slice Machine",
  );
});

test.skip("I can access the repository using the open icon", async ({
  sliceMachinePage,
  procedures,
}) => {
  procedures.mock("getState", ({ data }) => {
    const result = data as { env: { manifest: { apiEndpoint: string } } };
    result.env.manifest.apiEndpoint =
      "https://example-prismic-repo.cdn.prismic.io/api/v2";
    return result;
  });

  await sliceMachinePage.gotoDefaultPage();
  await expect(sliceMachinePage.menu.repositoryLink).toBeVisible();

  const newTabPromise = sliceMachinePage.page.waitForEvent("popup");
  await sliceMachinePage.menu.repositoryLink.click();
  const newTab = await newTabPromise;
  await newTab.waitForLoadState();

  await expect(newTab).toHaveURL(
    "https://prismic.io/dashboard/login?redirect_uri=https://example-prismic-repo.prismic.io/",
  );
});

test("I access the changelog from Slice Machine version", async ({
  pageTypesTablePage,
  changelogPage,
  procedures,
}) => {
  procedures.mock("versions.getRunningSliceMachineVersion", () => "1.0.42", {
    execute: false,
  });

  await pageTypesTablePage.goto();
  await pageTypesTablePage.menu.getAppVersion("1.0.42").click();

  await expect(changelogPage.breadcrumbLabel).toBeVisible();
});

test("I can see the updates available warning and access changelog from it", async ({
  pageTypesTablePage,
  changelogPage,
  procedures,
}) => {
  procedures.mock("versions.checkIsSliceMachineUpdateAvailable", () => true, {
    execute: false,
  });

  await pageTypesTablePage.goto();
  await expect(pageTypesTablePage.menu.updatesAvailableTitle).toBeVisible();
  await pageTypesTablePage.menu.updatesAvailableButton.click();

  await expect(changelogPage.breadcrumbLabel).toBeVisible();
});

test("I cannot see the updates available warning", async ({
  pageTypesTablePage,
  procedures,
}) => {
  procedures.mock("versions.checkIsAdapterUpdateAvailable", () => false, {
    execute: false,
  });

  procedures.mock("versions.checkIsSliceMachineUpdateAvailable", () => false, {
    execute: false,
  });

  await pageTypesTablePage.goto();
  await expect(pageTypesTablePage.menu.appVersion).toBeVisible();
  await expect(pageTypesTablePage.menu.updatesAvailableTitle).not.toBeVisible();
});

// NOTE: This tests doesn't use page objects as the Master Slice Library preview modal
//       is meant to be a temporary experiment lasting a few weeks, so it didn't really
//       make sense to implement a page object for such a feature.
test('I can open a modal describing Master Slice Libraries by clicking the "Master Slice Library" button', async ({
  sliceMachinePage,
  procedures,
}) => {
  procedures.mock("getState", ({ data }) => {
    const result = data as { env: { manifest: { apiEndpoint: string } } };
    result.env.manifest.apiEndpoint =
      "https://example-prismic-repo.cdn.prismic.io/api/v2";
    return result;
  });

  await sliceMachinePage.gotoDefaultPage();
  await expect(sliceMachinePage.menu.masterSliceLibraryButton).toBeVisible();

  const modal = sliceMachinePage.page.getByRole("dialog");
  const modalHeader = modal.getByText("Master Slice Library Generator (BETA)", {
    exact: true,
  });
  await sliceMachinePage.menu.masterSliceLibraryButton.click();
  await expect(modalHeader).toBeVisible();

  const exampleLink = modal.getByRole("link", {
    name: "example slice library",
    exact: false,
  });
  const newExampleTabPromise = sliceMachinePage.page.waitForEvent("popup");

  await exampleLink.click();

  const newExampleTab = await newExampleTabPromise;
  await newExampleTab.waitForLoadState();

  await expect(newExampleTab).toHaveURL(
    "https://slicify-app.vercel.app/slice-library",
  );

  const codeLink = modal.getByText("Get the code", { exact: true });
  const newCodeTabPromise = sliceMachinePage.page.waitForEvent("popup");

  await codeLink.click();

  const newCodeTab = await newCodeTabPromise;
  await newCodeTab.waitForLoadState();

  await expect(newCodeTab).toHaveURL(
    "https://github.com/prismicio-solution-engineering/slicify-library#readme",
  );
});
