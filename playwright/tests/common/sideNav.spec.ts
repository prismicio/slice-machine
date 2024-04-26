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

test("I can access the repository using the open icon", async ({
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

  await expect(newTab).toHaveTitle("prismic.io - Example Prismic Repo");
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

test.describe("Tutorial tooltip", () => {
  test.use({
    onboarded: false,
    reduxStorage: {
      lastSyncChange: new Date(new Date().getTime() - 3600000).getTime(),
    },
  });

  test("I can close the tutorial video tooltip and it stays close", async ({
    sliceMachinePage,
    procedures,
    generateLibraries,
    generateCustomTypes,
  }) => {
    const libraries = generateLibraries({ slicesCount: 1 });

    // We mock a page type with a slice that is a requirement for the review dialog
    procedures.mock("getState", ({ data }) => ({
      ...(data as Record<string, unknown>),
      libraries,
      customTypes: generateCustomTypes({ typesCount: 1, libraries }),
      remoteCustomTypes: [],
      remoteSlices: [],
      clientError: undefined,
    }));

    await sliceMachinePage.gotoDefaultPage();

    // We close the in app guide and review dialogs that are requirements for the tutorial tooltip display
    await sliceMachinePage.inAppGuideDialog.closeButton.click();
    await sliceMachinePage.reviewDialog.closeButton.click();

    // Then tutorial tooltip open after the review dialog
    await expect(sliceMachinePage.menu.tutorialVideoTooltipTitle).toBeVisible();
    await sliceMachinePage.menu.tutorialVideoTooltipCloseButton.click();
    await expect(
      sliceMachinePage.menu.tutorialVideoTooltipTitle,
    ).not.toBeVisible();

    await sliceMachinePage.page.reload();
    await expect(sliceMachinePage.menu.pageTypesLink).toBeVisible();

    await expect(
      sliceMachinePage.menu.tutorialVideoTooltipTitle,
    ).not.toBeVisible();
  });
});

test('I can access the Academy from the "Learn Prismic" link', async ({
  sliceMachinePage,
}) => {
  await sliceMachinePage.gotoDefaultPage();
  await expect(sliceMachinePage.menu.learnPrismicLink).toBeVisible();

  const newTabPromise = sliceMachinePage.page.waitForEvent("popup");
  await sliceMachinePage.menu.learnPrismicLink.click();
  const newTab = await newTabPromise;
  await newTab.waitForLoadState();

  await expect(newTab).toHaveTitle(/Prismic Academy/);
});

test('I can access the repository\'s users page from the "Invite team" link', async ({
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
  await expect(sliceMachinePage.menu.inviteTeamLink).toBeVisible();

  const newTabPromise = sliceMachinePage.page.waitForEvent("popup");
  await sliceMachinePage.menu.inviteTeamLink.click();
  const newTab = await newTabPromise;
  await newTab.waitForLoadState();

  // We cannot test the title since it only contains the repository's name.
  await expect(newTab).toHaveURL(
    "https://example-prismic-repo.prismic.io/settings/users",
  );
});
