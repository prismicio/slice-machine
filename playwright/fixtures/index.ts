import { test as base, expect } from "@playwright/test";

import { PageTypesTablePage } from "../pages/PageTypesTablePage";
import { PageTypeBuilderPage } from "../pages/PageTypesBuilderPage";
import { CustomTypesTablePage } from "../pages/CustomTypesTablePage";
import { CustomTypesBuilderPage } from "../pages/CustomTypesBuilderPage";
import { SlicesTablePage } from "../pages/SlicesTablePage";
import { SliceBuilderPage } from "../pages/SliceBuilderPage";
import { SliceSimulatorPage } from "../pages/SliceSimulator";
import { ChangesPage } from "../pages/ChangesPage";
import { ChangelogPage } from "../pages/ChangelogPage";
import { Menu } from "../pages/components/Menu";
import config from "../playwright.config";
import { generateRandomId } from "../utils/generateRandomId";

export type MyFixtures = {
  /**
   * Pages
   */
  pageTypesTablePage: PageTypesTablePage;
  pageTypesBuilderPage: PageTypeBuilderPage;
  customTypesTablePage: CustomTypesTablePage;
  customTypesBuilderPage: CustomTypesBuilderPage;
  sliceTablePage: SlicesTablePage;
  sliceBuilderPage: SliceBuilderPage;
  sliceSimulatorPage: SliceSimulatorPage;
  changesPage: ChangesPage;
  changelogPage: ChangelogPage;

  /**
   * Global
   */
  menu: Menu;

  /**
   * Data
   */
  pageType: Record<"name", string>;
  customType: Record<"name", string>;
  slice: Record<"name", string>;
};

/**
 * Default test fixture
 */
export const test = base.extend<MyFixtures>({
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
  sliceTablePage: async ({ page }, use) => {
    await use(new SlicesTablePage(page));
  },
  sliceBuilderPage: async ({ page }, use) => {
    await use(new SliceBuilderPage(page));
  },
  sliceSimulatorPage: async ({ page }, use) => {
    await use(new SliceSimulatorPage(page));
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
  pageType: async ({}, use) => {
    // TODO: Create page type data here
  },
  customType: async ({}, use) => {
    // TODO: Create custom type data here
  },
  slice: async ({ sliceTablePage, sliceBuilderPage }, use) => {
    // Open create modal
    await sliceTablePage.goto();
    await expect(sliceTablePage.title).toBeVisible();
    await sliceTablePage.openCreateModal();

    // Create slice
    const sliceName = "Slice" + generateRandomId();
    await sliceTablePage.createSliceModal.createSlice(sliceName);

    // Check slice builder
    await expect(sliceBuilderPage.breadcrumb).toBeVisible();
    await expect(sliceBuilderPage.breadcrumb).toContainText(sliceName);
    await expect(sliceBuilderPage.staticZonePlaceholder).toBeVisible();
    await expect(sliceBuilderPage.repeatableZonePlaceholder).toBeVisible();
    await expect(sliceBuilderPage.saveButton).toBeDisabled();

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
            origin: config.use?.baseURL as string,
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
