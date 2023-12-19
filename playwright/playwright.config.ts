import { type PlaywrightTestConfig, devices } from "@playwright/test";

// See https://playwright.dev/docs/api/class-testconfig
const config = {
  // Configuration for the expect assertion library
  expect: {
    // Maximum time expect() should wait for the condition to be met. For
    // example in `await expect(locator).toHaveText();`
    timeout: 30_000,
  },

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env["CI"],

  // Configure projects for major browsers.
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],

  // Retry on CI only.
  retries: process.env["CI"] ? 2 : 0,

  // Reporter to use.
  reporter: process.env["CI"]
    ? [["github"], ["html"]]
    : [
        [
          "html",
          {
            open: "never",
          },
        ],
      ],

  // Whether to report slow test files (> 5min).
  reportSlowTests: {
    max: 0,
    threshold: 300_000,
  },

  // Directory that will be recursively scanned for test files.
  testDir: "./tests",

  // Maximum time one test can run for.
  timeout: 120_000,

  // Playwright Test provides many options to configure test environment, Browser, BrowserContext and more.
  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    baseURL: "http://localhost:9999",

    // Collect trace when retrying the failed test.
    trace: "on",
    video: "off",
    screenshot: "on",
    testIdAttribute: "data-cy",
  },

  // Run local dev servers before starting the tests if needed.
  webServer: [
    {
      cwd: "..",
      command: process.env["CI"] ? "yarn dev:e2e-next" : "yarn dev",
      url: process.env["CI"]
        ? "http://localhost:8000/"
        : "http://localhost:3000/",
      reuseExistingServer: !process.env["CI"],
      stdout: "pipe",
      timeout: 120_000,
    },
    {
      cwd: "../e2e-projects/next",
      command: "yarn slicemachine:dev",
      url: "http://localhost:9999/",
      reuseExistingServer: !process.env["CI"],
      stdout: "pipe",
      timeout: 120_000,
    },
  ],
} satisfies PlaywrightTestConfig;

export default config;
