import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import { test as baseTest, expect } from "@playwright/test";

import { PageTypesTablePage } from "../pages/PageTypesTablePage";
import { PageTypeBuilderPage } from "../pages/PageTypesBuilderPage";
import { CustomTypesTablePage } from "../pages/CustomTypesTablePage";
import { CustomTypesBuilderPage } from "../pages/CustomTypesBuilderPage";
import { SlicesListPage } from "../pages/SlicesListPage";
import { SliceBuilderPage } from "../pages/SliceBuilderPage";
import { ChangesPage } from "../pages/ChangesPage";
import { ChangelogPage } from "../pages/ChangelogPage";
import { SliceMachinePage } from "../pages/SliceMachinePage";
import { generateRandomId } from "../utils/generateRandomId";
import config from "../playwright.config";

export type DefaultFixtures = {
  /**
   * Pages
   */
  sliceMachinePage: SliceMachinePage;
  pageTypesTablePage: PageTypesTablePage;
  pageTypesBuilderPage: PageTypeBuilderPage;
  customTypesTablePage: CustomTypesTablePage;
  customTypesBuilderPage: CustomTypesBuilderPage;
  slicesListPage: SlicesListPage;
  sliceBuilderPage: SliceBuilderPage;
  changesPage: ChangesPage;
  changelogPage: ChangelogPage;

  /**
   * Data
   */
  reusablePageType: { name: string };
  singlePageType: { name: string };
  reusableCustomType: { name: string };
  singleCustomType: { name: string };
  slice: { name: string };
};

/**
 * Default test fixture
 */
export const defaultTest = (
  options: {
    onboarded?: boolean;
    reduxStorage?: Record<string, unknown>;
    storage?: Record<string, unknown>;
  } = {},
) => {
  const { onboarded = true, reduxStorage = {}, storage = {} } = options;

  return baseTest.extend<DefaultFixtures>({
    /**
     * Pages
     */
    sliceMachinePage: async ({ page }, use) => {
      await use(new SliceMachinePage(page));
    },
    pageTypesTablePage: async ({ page }, use) => {
      await use(new PageTypesTablePage(page));
    },
    pageTypesBuilderPage: async ({ page }, use) => {
      await use(new PageTypeBuilderPage(page));
    },
    customTypesTablePage: async ({ page }, use) => {
      await use(new CustomTypesTablePage(page));
    },
    customTypesBuilderPage: async ({ page }, use) => {
      await use(new CustomTypesBuilderPage(page));
    },
    slicesListPage: async ({ page }, use) => {
      await use(new SlicesListPage(page));
    },
    sliceBuilderPage: async ({ page }, use) => {
      await use(new SliceBuilderPage(page));
    },
    changesPage: async ({ page }, use) => {
      await use(new ChangesPage(page));
    },
    changelogPage: async ({ page }, use) => {
      await use(new ChangelogPage(page));
    },

    /**
     * Data
     */
    reusablePageType: async ({ pageTypesTablePage }, use) => {
      await pageTypesTablePage.goto();
      await pageTypesTablePage.openCreateDialog();

      const pageTypeName = "Page Type " + generateRandomId();
      await pageTypesTablePage.createTypeDialog.createType(
        pageTypeName,
        "reusable",
      );

      await use({ name: pageTypeName });
    },
    singlePageType: async ({ pageTypesTablePage }, use) => {
      await pageTypesTablePage.goto();
      await pageTypesTablePage.openCreateDialog();

      const pageTypeName = "Page Type " + generateRandomId();
      await pageTypesTablePage.createTypeDialog.createType(
        pageTypeName,
        "single",
      );

      await use({ name: pageTypeName });
    },
    reusableCustomType: async ({ customTypesTablePage }, use) => {
      await customTypesTablePage.goto();
      await customTypesTablePage.openCreateDialog();

      const customTypeName = "Custom Type " + generateRandomId();
      await customTypesTablePage.createTypeDialog.createType(
        customTypeName,
        "reusable",
      );

      await use({ name: customTypeName });
    },
    singleCustomType: async ({ customTypesTablePage }, use) => {
      await customTypesTablePage.goto();
      await customTypesTablePage.openCreateDialog();

      const customTypeName = "Custom Type " + generateRandomId();
      await customTypesTablePage.createTypeDialog.createType(
        customTypeName,
        "single",
      );

      await use({ name: customTypeName });
    },
    slice: async ({ slicesListPage }, use) => {
      await slicesListPage.goto();
      await expect(slicesListPage.breadcrumbLabel).toBeVisible();
      await slicesListPage.openCreateDialog();

      const sliceName = "Slice" + generateRandomId();
      await slicesListPage.createSliceDialog.createSlice(sliceName);

      await use({ name: sliceName });
    },

    /**
     * Page
     */
    page: async ({ browser }, use) => {
      // Create redux storage state
      const userContext = onboarded
        ? {
            userReview: {
              onboarding: false,
              advancedRepository: true,
            },
            updatesViewed: {
              latest: null,
              latestNonBreaking: null,
            },
            hasSeenChangesToolTip: true,
            hasSeenSimulatorToolTip: true,
            hasSeenTutorialsToolTip: true,
            authStatus: "unknown",
            lastSyncChange: null,
            ...reduxStorage,
          }
        : {
            userReview: {
              onboarding: onboarded,
              advancedRepository: false,
            },
            updatesViewed: {
              latest: null,
              latestNonBreaking: null,
            },
            hasSeenChangesToolTip: false,
            hasSeenSimulatorToolTip: false,
            hasSeenTutorialsToolTip: false,
            authStatus: "unknown",
            lastSyncChange: null,
            ...reduxStorage,
          };

      // Create new storage state
      const SLICE_MACHINE_STORAGE_PREFIX = "slice-machine";
      const storageFormatted = Object.entries(storage).map(([key, value]) => ({
        name: `${SLICE_MACHINE_STORAGE_PREFIX}_${key}`,
        value: JSON.stringify(value),
      }));
      const newStorage = onboarded
        ? [
            {
              name: `${SLICE_MACHINE_STORAGE_PREFIX}_isInAppGuideOpen`,
              value: "false",
            },
          ]
            .filter(
              (item) =>
                storageFormatted.findIndex(
                  (formattedItem) => formattedItem.name === item.name,
                ) === -1,
            )
            .concat(storageFormatted)
        : storageFormatted;

      // Onboard user in Local Storage by default
      const storageState = {
        cookies: [],
        origins: [
          {
            origin: config.use.baseURL,
            localStorage: [
              {
                name: "persist:root",
                value: JSON.stringify({
                  userContext: JSON.stringify(userContext),
                }),
              },
            ].concat(newStorage),
          },
        ],
      };

      // Create new page object with new context
      const newContext = await browser.newContext({ storageState });
      const page = await newContext.newPage();

      // Logout user by default
      try {
        await fs.rm(path.join(os.homedir(), ".prismic"));
      } catch (error) {
        // Ignore since it means the user is already logged out
      }

      // Propagate the modified page to the test
      await use(page);
    },
  });
};

export const test = {
  ...baseTest,
  run: defaultTest,
};
