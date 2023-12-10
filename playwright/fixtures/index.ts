import * as dotenv from "dotenv";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";
import { decode } from "@msgpack/msgpack";
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

dotenv.config({ path: `.env.local` });

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
  options: { loggedIn?: boolean; onboarded?: boolean } = {},
) => {
  const { loggedIn = false, onboarded = true } = options;

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
      // Onboard user in Local Storage by default
      let context = await browser.newContext({
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
                      updatesViewed: {
                        latest: null,
                        latestNonBreaking: null,
                      },
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

      // Prevent user to be onboarded if needed
      if (!onboarded) {
        context = await browser.newContext({
          storageState: {
            cookies: [],
            origins: [
              {
                origin: config.use.baseURL,
                localStorage: [],
              },
            ],
          },
        });
      }

      // Create new page object with new context
      const page = await context.newPage();

      // Logout user by default
      try {
        await fs.rm(path.join(os.homedir(), ".prismic"));
      } catch (error) {
        // Ignore since it means the user is already logged out
      }

      // Login user if needed
      if (loggedIn) {
        // In CI we define a PRISMIC_URL env variable to fasten the tests
        let prismicUrl = process.env["PRISMIC_URL"];

        // In local we get the Prismic URL from the browser, it helps to avoid
        // switching manually between Wroom and Prismic
        if (!prismicUrl) {
          await page.route(
            "*/**/_manager",
            async (route) => {
              const postDataBuffer = route.request().postDataBuffer() as Buffer;
              const postData = decode(postDataBuffer) as Record<
                "procedurePath",
                unknown[]
              >;

              if (postData.procedurePath[0] === "getState") {
                const response = await route.fetch();
                const existingBody = await response.body();
                const existingData = (
                  decode(existingBody) as Record<"data", unknown>
                ).data as Record<
                  "env",
                  {
                    endpoints: { PrismicWroom: string };
                  }
                >;

                // Get Prismic URL from the response of the getState call
                prismicUrl = existingData.env.endpoints.PrismicWroom;

                await route.continue();
              }
            },
            // Ensure only the first getState call is intercepted
            {
              times: 1,
            },
          );

          // Visit the page to trigger the getState call and wait for it
          await page.goto("/");
          await page.waitForResponse("*/**/_manager");
        }

        const activeEnv = prismicUrl?.includes("wroom") ? "WROOM" : "PRISMIC";
        const email = process.env[`${activeEnv}_EMAIL`];
        const password = process.env[`${activeEnv}_PASSWORD`];

        if (!prismicUrl) {
          console.warn("Could not find Prismic URL.");
        } else if (!email || !password) {
          console.warn(
            `Missing EMAIL or PASSWORD environment variables for ${activeEnv} environment.`,
          );
        } else {
          // Do the authentication call
          const res = await fetch(
            new URL("./authentication/signin", prismicUrl).toString(),
            {
              method: "post",
              body: JSON.stringify({
                email,
                password,
              }),
              headers: {
                "Content-Type": "application/json",
              },
            },
          );

          if (!res.headers.has("Set-Cookie")) {
            // If the authentication fails, log the error
            const reason = await res.text();
            console.error(
              "Could not authenticate to prismic. Please check the credentials.",
              reason,
            );
          } else {
            // If the authentication succeeded, save the cookies to persist it
            await fs.writeFile(
              path.join(os.homedir(), ".prismic"),
              JSON.stringify({
                base: new URL(prismicUrl).toString(),
                cookies:
                  res.headers.get("Set-Cookie")?.split(", ").join("; ") ?? "",
              }),
            );
          }
        }
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
