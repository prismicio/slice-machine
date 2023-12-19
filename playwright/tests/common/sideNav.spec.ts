import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import { mockManagerProcedures } from "../../utils/mockManagerProcedures";
import { generateLibraries, generateTypes } from "../../mocks";

test.describe("Side nav", () => {
  test.run()(
    "I can navigate through all menu entries",
    async ({
      sliceMachinePage,
      pageTypesTablePage,
      customTypesTablePage,
      slicesListPage,
      changesPage,
      changelogPage,
    }) => {
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

      await changelogPage.menu.changelogLink.click();
      await expect(changelogPage.breadcrumbLabel).toBeVisible();
      expect(await sliceMachinePage.page.title()).toContain(
        "Changelog - Slice Machine",
      );
    },
  );

  test.run()(
    "I access the changelog from Slice Machine version",
    async ({ pageTypesTablePage, changelogPage }) => {
      await mockManagerProcedures({
        page: pageTypesTablePage.page,
        procedures: [
          {
            path: "versions.getRunningSliceMachineVersion",
            data: () => "1.0.42",
            execute: false,
          },
        ],
      });

      await pageTypesTablePage.goto();
      await pageTypesTablePage.menu.getAppVersion("1.0.42").click();

      await expect(changelogPage.breadcrumbLabel).toBeVisible();
    },
  );

  test.run()(
    "I can see the updates available warning and access changelog from it",
    async ({ pageTypesTablePage, changelogPage }) => {
      await mockManagerProcedures({
        page: pageTypesTablePage.page,
        procedures: [
          {
            path: "versions.checkIsSliceMachineUpdateAvailable",
            data: () => true,
            execute: false,
          },
        ],
      });

      await pageTypesTablePage.goto();
      await expect(pageTypesTablePage.menu.updatesAvailableTitle).toBeVisible();
      await pageTypesTablePage.menu.updatesAvailableButton.click();

      await expect(changelogPage.breadcrumbLabel).toBeVisible();
    },
  );

  test.run()(
    "I cannot see the updates available warning",
    async ({ pageTypesTablePage }) => {
      await mockManagerProcedures({
        page: pageTypesTablePage.page,
        procedures: [
          {
            path: "versions.checkIsAdapterUpdateAvailable",
            data: () => false,
            execute: false,
          },
          {
            path: "versions.checkIsSliceMachineUpdateAvailable",
            data: () => false,
            execute: false,
          },
        ],
      });

      await pageTypesTablePage.goto();
      await expect(pageTypesTablePage.menu.appVersion).toBeVisible();
      await expect(
        pageTypesTablePage.menu.updatesAvailableTitle,
      ).not.toBeVisible();
    },
  );

  test.run({
    onboarded: false,
    reduxStorage: {
      lastSyncChange: new Date(new Date().getTime() - 3600000).getTime(),
    },
  })(
    "I can close the tutorial video tooltip and it stays close",
    async ({ sliceMachinePage }) => {
      const libraries = generateLibraries({ nbSlices: 1 });

      // We mock a page type with a slice that is a requirement for the review dialog
      await mockManagerProcedures({
        page: sliceMachinePage.page,
        procedures: [
          {
            path: "getState",
            data: (data) => ({
              ...data,
              libraries,
              customTypes: generateTypes({ nbTypes: 1, libraries }),
              remoteCustomTypes: [],
              remoteSlices: [],
              clientError: undefined,
            }),
          },
        ],
      });

      await sliceMachinePage.gotoDefaultPage();

      // We close the in app guide and review dialogs that are requirements for the tutorial tooltip display
      await sliceMachinePage.inAppGuideDialog.closeButton.click();
      await sliceMachinePage.reviewDialog.closeButton.click();

      // Then tutorial tooltip open after the review dialog
      await expect(
        sliceMachinePage.menu.tutorialVideoTooltipTitle,
      ).toBeVisible();
      await sliceMachinePage.menu.tutorialVideoTooltipCloseButton.click();
      await expect(
        sliceMachinePage.menu.tutorialVideoTooltipTitle,
      ).not.toBeVisible();

      await sliceMachinePage.page.reload();
      await expect(sliceMachinePage.menu.pageTypesLink).toBeVisible();

      await expect(
        sliceMachinePage.menu.tutorialVideoTooltipTitle,
      ).not.toBeVisible();
    },
  );
});
