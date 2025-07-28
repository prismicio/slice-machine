import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import { environments } from "../../mocks";

// TODO: Fix if we release auto-sync (without feature flag)
// Test skipped as the feature is not currently maintained, and the test is randomly failing
// https://linear.app/prismic/issue/DT-2526/aadev-i-dont-want-to-have-flaky-test
test.skip("I can see the auto-sync succeed when making a change", async ({
  pageTypesBuilderPage,
  reusablePageType,
  procedures,
}) => {
  procedures.mock(
    "prismicRepository.fetchEnvironments",
    () => ({ environments }),
    { execute: false },
  );
  procedures.mock(
    "project.fetchActiveEnvironment",
    () => ({
      // Dev environment
      type: "ok",
      activeEnvironment: environments[2],
    }),
    { execute: false },
  );
  procedures.mock("getState", ({ data }) => ({
    ...(data as Record<string, unknown>),
    remoteCustomTypes: [],
    remoteSlices: [],
    clientError: undefined,
  }));
  procedures.mock("prismicRepository.pushChanges", () => undefined, {
    delay: 1000,
    execute: false,
  });

  await pageTypesBuilderPage.goto(reusablePageType.name);

  await pageTypesBuilderPage.addStaticField({
    type: "Rich Text",
    name: "My Rich Text",
    expectedId: "my_rich_text",
  });

  await expect(pageTypesBuilderPage.menu.autoSyncSyncing).toBeVisible();
  await expect(pageTypesBuilderPage.menu.autoSyncSynced).toBeVisible();
});

// TODO: Fix if we release auto-sync (without feature flag)
// When we're creating a new field or adding a slice, the success toast will
// prevent the error toast to be visible.
test.skip("I can see the auto-sync succeed after a failed attempt", async ({
  pageTypesBuilderPage,
  reusablePageType,
  procedures,
}) => {
  procedures.mock(
    "prismicRepository.fetchEnvironments",
    () => ({ environments }),
    { execute: false },
  );
  procedures.mock(
    "project.fetchActiveEnvironment",
    () => ({
      // Dev environment
      type: "ok",
      activeEnvironment: environments[2],
    }),
    { execute: false },
  );
  procedures.mock("getState", ({ data }) => ({
    ...(data as Record<string, unknown>),
    remoteCustomTypes: [],
    remoteSlices: [],
    clientError: undefined,
  }));
  procedures.mock(
    "prismicRepository.pushChanges",
    () => {
      throw new Error("Error");
    },
    {
      delay: 1000,
    },
  );

  await pageTypesBuilderPage.goto(reusablePageType.name);

  await pageTypesBuilderPage.addStaticField({
    type: "Rich Text",
    name: "My Rich Text",
    expectedId: "my_rich_text",
  });

  await expect(pageTypesBuilderPage.menu.autoSyncSyncing).toBeVisible();
  await expect(pageTypesBuilderPage.menu.autoSyncFailed).toBeVisible();

  procedures.mock("prismicRepository.pushChanges", () => undefined, {
    delay: 1000,
    execute: false,
  });

  await expect(pageTypesBuilderPage.menu.autoSyncFailedMessage).toBeVisible();
  await pageTypesBuilderPage.menu.autoSyncFailedRetry.click();

  await expect(pageTypesBuilderPage.menu.autoSyncSyncing).toBeVisible();
  await expect(pageTypesBuilderPage.menu.autoSyncSynced).toBeVisible();
});

// TODO: Fix if we release auto-sync (without feature flag)
// When we're creating a new field or adding a slice, the success toast will
// prevent the error toast to be visible.
test.skip("I can see the auto-sync fail because of an hard limit", async ({
  pageTypesBuilderPage,
  reusablePageType,
  procedures,
}) => {
  procedures.mock(
    "prismicRepository.fetchEnvironments",
    () => ({ environments }),
    { execute: false },
  );
  procedures.mock(
    "project.fetchActiveEnvironment",
    () => ({
      // Dev environment
      type: "ok",
      activeEnvironment: environments[2],
    }),
    { execute: false },
  );
  procedures.mock("getState", ({ data }) => ({
    ...(data as Record<string, unknown>),
    remoteCustomTypes: [],
    remoteSlices: [],
    clientError: undefined,
  }));
  procedures.mock(
    "prismicRepository.pushChanges",
    () => ({
      type: "HARD",
      details: {
        customTypes: [],
      },
    }),
    {
      delay: 1000,
    },
  );

  await pageTypesBuilderPage.goto(reusablePageType.name);

  await pageTypesBuilderPage.addStaticField({
    type: "Rich Text",
    name: "My Rich Text",
    expectedId: "my_rich_text",
  });

  await expect(pageTypesBuilderPage.menu.autoSyncSyncing).toBeVisible();
  await expect(pageTypesBuilderPage.menu.autoSyncFailed).toBeVisible();
});
