import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import { environments } from "../../mocks";

test("I can see the auto-sync succeed when making a change", async ({
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

test("I can see the auto-sync succeed after a failed attempt", async ({
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

test("I can see the auto-sync fail because of an hard limit", async ({
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
