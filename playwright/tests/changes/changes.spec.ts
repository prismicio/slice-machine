import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { expect } from "@playwright/test";

import { test } from "../../fixtures";

test("I cannot see the login screen when logged in", async ({
  changesPage,
  procedures,
}) => {
  procedures.mock("getState", ({ data }) => ({
    ...(data as Record<string, unknown>),
    clientError: {
      clientError: undefined,
    },
  }));

  await changesPage.goto();
  await expect(changesPage.loginButton).not.toBeVisible();
  await expect(changesPage.notLoggedInTitle).not.toBeVisible();
  await expect(changesPage.notAuthorizedTitle).not.toBeVisible();
});

test("I can see the login screen when logged out", async ({
  changesPage,
  procedures,
}) => {
  procedures.mock("getState", ({ data }) => ({
    ...(data as Record<string, unknown>),
    clientError: {
      status: 401,
    },
  }));

  await changesPage.goto();
  await expect(changesPage.loginButton).toBeVisible();
  await expect(changesPage.notLoggedInTitle).toBeVisible();
});

test("I can see the unauthorized screen when not authorized", async ({
  changesPage,
  procedures,
}) => {
  procedures.mock("getState", ({ data }) => ({
    ...(data as Record<string, unknown>),
    clientError: {
      status: 403,
    },
  }));

  await changesPage.goto();
  await expect(changesPage.loginButton).not.toBeVisible();
  await expect(changesPage.notAuthorizedTitle).toBeVisible();
});

test("I can see the empty state when I don't have any changes to push", async ({
  changesPage,
  procedures,
  generateLibraries,
}) => {
  procedures.mock("getState", ({ data }) => ({
    ...(data as Record<string, unknown>),
    libraries: generateLibraries({ slicesCount: 0 }),
    customTypes: [],
    remoteCustomTypes: [],
    remoteSlices: [],
    clientError: undefined,
  }));

  await changesPage.goto();
  await expect(changesPage.loginButton).not.toBeVisible();
  await expect(changesPage.blankSlateTitle).toBeVisible();
});

test("I can see the changes I have to push", async ({
  changesPage,
  procedures,
  generateLibraries,
  generateCustomTypes,
}) => {
  const types = generateCustomTypes({ typesCount: 1 });
  const customType = types[0] as CustomType;
  procedures.mock("getState", ({ data }) => ({
    ...(data as Record<string, unknown>),
    libraries: generateLibraries({ slicesCount: 0 }),
    customTypes: types,
    remoteCustomTypes: [],
    remoteSlices: [],
    clientError: undefined,
  }));

  await changesPage.goto();
  await expect(changesPage.loginButton).not.toBeVisible();
  await changesPage.checkCustomTypeName(
    customType.id,
    customType.label as string,
  );
  await changesPage.checkCustomTypeApiId(customType.id);
  await changesPage.checkCustomTypeStatus(customType.id, "New");
});

test("I can update screenshots", async ({ changesPage, procedures, slice }) => {
  procedures.mock("getState", ({ data }) => ({
    ...(data as Record<string, unknown>),
    clientError: undefined,
  }));

  await changesPage.goto();
  await changesPage.openUpdateSliceScreenshotDialog(slice.name);

  await expect(
    changesPage.updateScreenshotDialog.screenshotPlaceholder,
  ).toBeVisible();
  await changesPage.updateScreenshotDialog.updateScreenshot(
    "slice-screenshot-imageLeft",
  );
  await expect(
    changesPage.updateScreenshotDialog.screenshotPlaceholder,
  ).not.toBeVisible();
});

test("I can push the changes I have", async ({
  changesPage,
  procedures,
  generateLibraries,
  generateCustomTypes,
}) => {
  procedures.mock("getState", ({ data }) => ({
    ...(data as Record<string, unknown>),
    libraries: generateLibraries({ slicesCount: 0 }),
    customTypes: generateCustomTypes({ typesCount: 1 }),
    remoteCustomTypes: [],
    remoteSlices: [],
    clientError: undefined,
  }));
  procedures.mock("prismicRepository.pushChanges", () => undefined, {
    execute: false,
  });

  await changesPage.goto();
  await expect(changesPage.loginButton).not.toBeVisible();
  await changesPage.pushChanges();
});

test("I can see an error when the push failed", async ({
  changesPage,
  procedures,
  generateLibraries,
  generateCustomTypes,
}) => {
  procedures.mock("getState", ({ data }) => ({
    ...(data as Record<string, unknown>),
    libraries: generateLibraries({ slicesCount: 0 }),
    customTypes: generateCustomTypes({ typesCount: 1 }),
    remoteCustomTypes: [],
    remoteSlices: [],
    clientError: undefined,
  }));
  procedures.mock(
    "prismicRepository.pushChanges",
    () => {
      throw new Error("Error");
    },
    { execute: false },
  );

  await changesPage.goto();
  await expect(changesPage.loginButton).not.toBeVisible();
  await changesPage.pushChangesButton.click();
  await expect(changesPage.unknownErrorMessage).toBeVisible();
});

test("I have to confirm the push when I reach a soft limit of deleted documents", async ({
  changesPage,
  procedures,
  generateLibraries,
  generateCustomTypes,
}) => {
  procedures.mock("getState", ({ data }) => ({
    ...(data as Record<string, unknown>),
    libraries: generateLibraries({ slicesCount: 0 }),
    customTypes: generateCustomTypes({ typesCount: 1 }),
    remoteCustomTypes: [],
    remoteSlices: [],
    clientError: undefined,
  }));
  procedures.mock(
    "prismicRepository.pushChanges",
    () => ({
      type: "SOFT",
      details: {
        customTypes: [],
      },
    }),
    {
      execute: false,
    },
  );

  await changesPage.goto();
  await expect(changesPage.loginButton).not.toBeVisible();
  await changesPage.pushChangesButton.click();
  await expect(changesPage.softLimitTitle).toBeVisible();

  procedures.mock("prismicRepository.pushChanges", () => undefined, {
    execute: false,
  });

  await changesPage.confirmDeleteDocuments();
});

test("I cannot push the changes when I reach a hard limit of deleted documents", async ({
  changesPage,
  procedures,
  generateLibraries,
  generateCustomTypes,
}) => {
  procedures.mock("getState", ({ data }) => ({
    ...(data as Record<string, unknown>),
    libraries: generateLibraries({ slicesCount: 0 }),
    customTypes: generateCustomTypes({ typesCount: 1 }),
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
    { execute: false },
  );

  await changesPage.goto();
  await expect(changesPage.loginButton).not.toBeVisible();
  await changesPage.pushChangesButton.click();

  procedures.mock("prismicRepository.pushChanges", () => undefined, {
    execute: false,
  });

  await expect(changesPage.hardLimitTitle).toBeVisible();
  await changesPage.hardLimitButton.click();
  await changesPage.checkPushedMessage();
});
