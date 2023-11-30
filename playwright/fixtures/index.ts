import { test as baseTest, expect } from "@playwright/test";

import { PageTypesTablePage } from "../pages/PageTypesTablePage";
import { PageTypeBuilderPage } from "../pages/PageTypesBuilderPage";
import { CustomTypesTablePage } from "../pages/CustomTypesTablePage";
import { CustomTypesBuilderPage } from "../pages/CustomTypesBuilderPage";
import { SlicesListPage } from "../pages/SlicesListPage";
import { SliceBuilderPage } from "../pages/SliceBuilderPage";
import { ChangesPage } from "../pages/ChangesPage";
import { ChangelogPage } from "../pages/ChangelogPage";
import config from "../playwright.config";
import { generateRandomId } from "../utils/generateRandomId";

export type Fixtures = {
  /**
   * Pages
   */
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
  pageType: { name: string };
  customType: { name: string };
  slice: { name: string };
};

/**
 * Default test fixture
 */
export const test = baseTest.extend<Fixtures>({
  /**
   * Pages
   */
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
  pageType: async ({ pageTypesTablePage, pageTypesBuilderPage }, use) => {
    await pageTypesTablePage.goto();
    await pageTypesTablePage.openCreateDialog();

    const pageTypeName = "Page Type " + generateRandomId();
    await pageTypesTablePage.createTypeDialog.createType(pageTypeName);
    await pageTypesBuilderPage.checkSavedMessage();

    await use({ name: pageTypeName });
  },
  customType: async ({ customTypesTablePage, customTypesBuilderPage }, use) => {
    await customTypesTablePage.goto();
    await customTypesTablePage.openCreateDialog();

    const customTypeName = "Custom Type " + generateRandomId();
    await customTypesTablePage.createTypeDialog.createType(customTypeName);
    await customTypesBuilderPage.checkSavedMessage();

    await use({ name: customTypeName });
  },
  slice: async ({ slicesListPage, sliceBuilderPage }, use) => {
    await slicesListPage.goto();
    await expect(slicesListPage.breadcrumbLabel).toBeVisible();
    await slicesListPage.openCreateDialog();

    const sliceName = "Slice" + generateRandomId();
    await slicesListPage.createSliceDialog.createSlice(sliceName);
    await sliceBuilderPage.checkSavedMessage();

    await use({ name: sliceName });
  },

  /**
   * Page object override
   */
  page: async ({ browser }, use) => {
    // Onboard user in Local Storage
    const context = await browser.newContext({
      storageState: {
        cookies: [],
        origins: [
          {
            origin: config.use.baseURL,
            localStorage: [
              {
                name: "persist:root",
                value: JSON.stringify({
                  userContext: {
                    userReview: {
                      onboarding: true,
                      advancedRepository: true,
                    },
                    updatesViewed: { latest: null, latestNonBreaking: null },
                    hasSeenChangesToolTip: true,
                    hasSeenSimulatorToolTip: true,
                    hasSeenTutorialsToolTip: true,
                    authStatus: "unknown",
                    lastSyncChange: null,
                  },
                }),
              },
              {
                name: "slice-machine_isInAppGuideOpen",
                value: "false",
              },
            ],
          },
        ],
      },
    });

    const page = await context.newPage();

    // Use the fixture value in the test.
    await use(page);

    // Gracefully close up everything
    await page.close();
    await context.close();
  },
});
