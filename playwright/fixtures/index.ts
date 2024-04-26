import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import { test as baseTest } from "@playwright/test";
import {
  createSliceMachineManagerClient,
  SliceMachineManagerClient,
} from "@slicemachine/manager/client";
import { createMockFactory, MockFactory } from "@prismicio/mock";

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
import { generateRandomId, MockManagerProcedures } from "../utils";
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
  reusablePageTypeFromUI: { name: string };
  singlePageType: { name: string };
  singlePageTypeFromUI: { name: string };
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
  mockFactory: MockFactory;
  generateLibraries: (args: {
    slicesCount: number;
  }) => Awaited<ReturnType<SliceMachineManagerClient["getState"]>>["libraries"];
  generateCustomTypes: (args: {
    typesCount: number;
    format?: "custom" | "page";
    libraries?: Awaited<
      ReturnType<SliceMachineManagerClient["getState"]>
    >["libraries"];
  }) => Awaited<
    ReturnType<SliceMachineManagerClient["getState"]>
  >["customTypes"];
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
  reusablePageType: async ({ manager, mockFactory }, use) => {
    const model = mockFactory.model.customType({
      label: "Page Type " + generateRandomId(),
      format: "page",
      repeatable: true,
      tabs: { Main: {} },
    });
    await manager.customTypes.createCustomType({ model });

    await use({ name: model.label });

    await manager.customTypes.deleteCustomType({ id: model.id });
  },
  reusablePageTypeFromUI: async ({ pageTypesTablePage, manager }, use) => {
    await pageTypesTablePage.goto();
    await pageTypesTablePage.openCreateDialog();

    const pageTypeName = "Page Type " + generateRandomId();
    await pageTypesTablePage.createTypeDialog.createType(
      pageTypeName,
      "reusable",
    );

    await use({ name: pageTypeName });

    await manager.customTypes.deleteCustomType({
      id: pageTypeName.toLowerCase().replace(" ", "_"),
    });
  },
  singlePageType: async ({ manager, mockFactory }, use) => {
    const model = mockFactory.model.customType({
      label: "Page Type " + generateRandomId(),
      format: "page",
      repeatable: false,
      tabs: { Main: {} },
    });
    await manager.customTypes.createCustomType({ model });

    await use({ name: model.label });

    await manager.customTypes.deleteCustomType({ id: model.id });
  },
  singlePageTypeFromUI: async ({ pageTypesTablePage, manager }, use) => {
    await pageTypesTablePage.goto();
    await pageTypesTablePage.openCreateDialog();

    const pageTypeName = "Page Type " + generateRandomId();
    await pageTypesTablePage.createTypeDialog.createType(
      pageTypeName,
      "single",
    );

    await use({ name: pageTypeName });

    await manager.customTypes.deleteCustomType({
      id: pageTypeName.toLowerCase().replace(" ", "_"),
    });
  },
  reusableCustomType: async ({ manager, mockFactory }, use) => {
    const model = mockFactory.model.customType({
      label: "Custom Type " + generateRandomId(),
      format: "custom",
      repeatable: true,
      tabs: { Main: {} },
    });
    await manager.customTypes.createCustomType({ model });

    await use({ name: model.label });

    await manager.customTypes.deleteCustomType({ id: model.id });
  },
  singleCustomType: async ({ manager, mockFactory }, use) => {
    const model = mockFactory.model.customType({
      label: "Custom Type " + generateRandomId(),
      format: "custom",
      repeatable: false,
      tabs: { Main: {} },
    });
    await manager.customTypes.createCustomType({ model });

    await use({ name: model.label });

    await manager.customTypes.deleteCustomType({ id: model.id });
  },
  slice: async ({ firstSliceLibrary, manager, mockFactory }, use) => {
    const model = mockFactory.model.sharedSlice({
      name: "Slice" + generateRandomId(),
      variations: [mockFactory.model.sharedSliceVariation({ id: "default" })],
    });
    await manager.slices.createSlice({
      libraryID: firstSliceLibrary.id,
      model,
    });

    await use({ name: model.name });

    await manager.slices.deleteSlice({
      libraryID: firstSliceLibrary.id,
      sliceID: model.id,
    });
  },
  repeatableZoneSlice: async (
    { firstSliceLibrary, manager, mockFactory },
    use,
  ) => {
    const model = mockFactory.model.sharedSlice({
      name: "Slice" + generateRandomId(),
      variations: [
        mockFactory.model.sharedSliceVariation({
          itemsFields: { existing_field: mockFactory.model.boolean() },
        }),
      ],
    });

    await manager.slices.createSlice({
      libraryID: firstSliceLibrary.id,
      model,
    });

    await use({ name: model.name });

    await manager.slices.deleteSlice({
      libraryID: firstSliceLibrary.id,
      sliceID: model.id,
    });
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
            advancedRepository: true,
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

    await newContext.close();
  },

  /**
   * Manager
   */
  // eslint-disable-next-line no-empty-pattern
  manager: async ({}, use, testInfo) => {
    const client = createSliceMachineManagerClient({
      serverURL: new URL("./_manager", testInfo.project.use.baseURL).toString(),
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

  // eslint-disable-next-line no-empty-pattern
  mockFactory: async ({}, use, testInfo) => {
    const mockFactory = createMockFactory({ seed: testInfo.testId });

    await use(mockFactory);
  },

  generateLibraries: async ({ mockFactory }, use) => {
    await use(({ slicesCount }) => {
      return [
        {
          name: "slices",
          path: "slices",
          isLocal: true,
          components: Array.from({ length: slicesCount }, () => {
            const variations = [mockFactory.model.sharedSliceVariation()];
            const model = mockFactory.model.sharedSlice({ variations });

            return {
              from: "slices",
              href: "slices",
              pathToSlice: "pathToSlice",
              fileName: "fileName",
              extension: "extension",
              model,
              screenshots: {},
              mocks: [],
            };
          }),
          meta: {
            isNodeModule: false,
            isDownloaded: false,
            isManual: true,
          },
        },
      ];
    });
  },

  generateCustomTypes: async ({ mockFactory }, use) => {
    await use(({ typesCount, format = "page", libraries }) => {
      return Array.from({ length: typesCount }, () => {
        if (libraries) {
          const choices: Record<string, { type: "SharedSlice" }> = {};
          for (const library of libraries) {
            for (const component of library.components) {
              choices[component.model.id] =
                mockFactory.model.sharedSliceChoice();
            }
          }

          return mockFactory.model.customType({
            format,
            tabs: {
              Main: {
                slices: mockFactory.model.sliceZone({ choices }),
              },
            },
          });
        } else {
          return mockFactory.model.customType({
            format,
            tabs: { Main: {} },
          });
        }
      });
    });
  },
});
