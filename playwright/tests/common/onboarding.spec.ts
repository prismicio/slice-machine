import { Fixtures, test as baseTest } from "../../fixtures";

import config from "../../playwright.config";

// Extend the base test to ensure user is not onboarded
const test = baseTest.extend<Fixtures>({
  page: async ({ browser }, use) => {
    const context = await browser.newContext({
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
    const page = await context.newPage();

    // Use the fixture value in the test.
    await use(page);

    // Gracefully close up everything
    await page.close();
    await context.close();
  },
});

test.describe.skip("Onboarding", () => {
  // TODO: Add tests
});
