import { MyFixtures, test as base } from "../../fixtures";

import config from "../../playwright.config";

// Extend the base test to ensure user is not onboarded
const test = base.extend<MyFixtures>({
  page: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: {
        cookies: [],
        origins: [
          {
            origin: config.use?.baseURL as string,
            localStorage: [],
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
    await browser.close();
  },
});

test.describe.skip("Onboarding", () => {
  // TODO: Add tests
});
