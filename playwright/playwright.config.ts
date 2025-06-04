import { type PlaywrightTestConfig, devices } from "@playwright/test";
import assert from "assert";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test.local", override: true });

declare const process: {
  env: {
    CI: boolean;
    PLAYWRIGHT_ADMIN_USERNAME: string;
    PLAYWRIGHT_ADMIN_PASSWORD: string;
    E2E_REPOSITORY: string | undefined;
    SM_ENV:
      | "dev-tools"
      | "marketing-tools"
      | "platform"
      | "staging"
      | "production";
  };
};

export const baseUrl = (() => {
  switch (process.env.SM_ENV) {
    case "production":
      return "https://prismic.io/";
    case "staging":
      return "https://wroom.io/";
    default:
      return `https://${process.env.SM_ENV}-wroom.com/`;
  }
})();

export const cluster = process.env.SM_ENV === "staging" ? "exp" : undefined;

export const auth = {
  username: process.env.PLAYWRIGHT_ADMIN_USERNAME,
  password: process.env.PLAYWRIGHT_ADMIN_PASSWORD,
};

assert.ok(auth.username, "Missing PLAYWRIGHT_ADMIN_USERNAME env variable.");
assert.ok(auth.password, "Missing PLAYWRIGHT_ADMIN_PASSWORD env variable.");

export const REPOSITORY_NAME_PREFIX = "e2e-tests-";

// See https://playwright.dev/docs/api/class-testconfig
const config = {
  globalTeardown: require.resolve("./globalTeardown.ts"),

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
    ? [["github"], ["blob"]]
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
    trace: "on-first-retry",

    // Configure the browser permissions to access the clipboard API.
    permissions: ["clipboard-read", "clipboard-write"],
  },

  // Run local dev servers before starting the tests if needed.
  webServer: {
    cwd: "..",
    command: "yarn play",
    url: "http://localhost:9999/",
    reuseExistingServer: !process.env["CI"],
    stdout: "pipe",
    timeout: 120_000,
  },

  // Opt out of parallel tests on CI to prioritize stability and reproducibility.
  // See: https://playwright.dev/docs/ci#workers
  workers: process.env["CI"] ? 1 : undefined,
} satisfies PlaywrightTestConfig;

export default config;
