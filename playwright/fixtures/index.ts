import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import { test as baseTest, expect } from "@playwright/test";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import {
  createSliceMachineManagerClient,
  SliceMachineManagerClient,
} from "@slicemachine/manager/client";

import { PageTypesTablePage } from "../pages/PageTypesTablePage";
import { PageTypeBuilderPage } from "../pages/PageTypesBuilderPage";
import { CustomTypesTablePage } from "../pages/CustomTypesTablePage";
import { CustomTypesBuilderPage } from "../pages/CustomTypesBuilderPage";
import { SlicesListPage } from "../pages/SlicesListPage";
import { SliceBuilderPage } from "../pages/SliceBuilderPage";
import { ChangesPage } from "../pages/ChangesPage";
import { SettingsPage } from "../pages/SettingsPage";
import { ChangelogPage } from "../pages/ChangelogPage";
import { SimulatorPage } from "../pages/SimulatorPage";
import { SliceMachinePage } from "../pages/SliceMachinePage";
import { generateRandomId } from "../utils/generateRandomId";
import { MockManagerProcedures } from "../utils";
import config from "../playwright.config";

type Options = {
  onboarded: boolean;
  reduxStorage: Record<string, unknown>;
  storage: Record<string, unknown>;
};

type Fixtures = {
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
  settingsPage: SettingsPage;
  changelogPage: ChangelogPage;
  simulatorPage: SimulatorPage;

  /**
   * Data
   */
  reusablePageType: { name: string };
  singlePageType: { name: string };
  reusableCustomType: { name: string };
  singleCustomType: { name: string };
  slice: { name: string };
  repeatableZoneSlice: { name: string };
  firstSliceLibrary: { id: string };

  /**
   * Manager
   */
  manager: SliceMachineManagerClient;

  /**
   * Mocks
   */
  procedures: MockManagerProcedures;
};

export const test = baseTest.extend<Options & Fixtures>({
  onboarded: [true, { option: true }],
  reduxStorage: [{}, { option: true }],
  storage: [{}, { option: true }],

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
  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  },
  changelogPage: async ({ page }, use) => {
    await use(new ChangelogPage(page));
  },
  simulatorPage: async ({ page }, use) => {
    await use(new SimulatorPage(page));
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
    await slicesListPage.addSliceDropdown.click();
    await slicesListPage.addSliceDropdownCreateNewAction.click();

    const sliceName = "Slice" + generateRandomId();
    await slicesListPage.createSliceDialog.createSlice(sliceName);

    await use({ name: sliceName });
  },
  repeatableZoneSlice: async ({ firstSliceLibrary, manager }, use) => {
    const sliceName = "Slice" + generateRandomId();
    const model = {
      id: sliceName,
      name: sliceName,
      type: "SharedSlice",
      variations: [
        {
          id: "default",
          name: "Default",
          description: "description",
          imageUrl: "imageUrl",
          version: "version",
          docURL: "docURL",
          items: { existing_field: { type: "Boolean" } },
        },
      ],
    } satisfies SharedSlice;

    await manager.slices.createSlice({
      libraryID: firstSliceLibrary.id,
      model,
    });

    await use({ name: model.name });
  },
  firstSliceLibrary: async ({ manager }, use) => {
    const config = await manager.project.getSliceMachineConfig();
    const libraryID = config.libraries?.[0];
    if (!libraryID) {
      throw new Error(
        "At least one library is required in `slicemachine.config.json`.",
      );
    }

    await use({ id: libraryID });
  },

  /**
   * Page
   */
  page: async ({ browser, onboarded, reduxStorage, storage }, use) => {
    // Create redux storage state
    const userContext = onboarded
      ? {
          userReview: {
            onboarding: false,
          },
          hasSeenChangesToolTip: true,
          hasSeenSimulatorToolTip: true,
          authStatus: "unknown",
          lastSyncChange: null,
          ...reduxStorage,
        }
      : {
          userReview: {
            onboarding: onboarded,
          },
          hasSeenChangesToolTip: false,
          hasSeenSimulatorToolTip: false,
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
            name: `${SLICE_MACHINE_STORAGE_PREFIX}_staticFieldsInfoDialogDismissed`,
            value: "true",
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

    await newContext.close();
  },

  /**
   * Manager
   */
  // eslint-disable-next-line no-empty-pattern
  manager: async ({}, use, config) => {
    const client = createSliceMachineManagerClient({
      serverURL: new URL("./_manager", config.project.use.baseURL).toString(),
    });

    await use(client);
  },

  /**
   * Mocks
   */
  procedures: async ({ page }, use) => {
    const procedures = await MockManagerProcedures.init(page);

    // Disable all experiments by default. Enable them in tests as needed.
    procedures.mock("getExperimentVariant", () => undefined);

    await use(procedures);
  },
});
