import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import { mockManagerProcedures } from "../../utils";
import { generateLibraries, generateTypes } from "../../mocks";

test.describe("Changes", () => {
  test.run()(
    "I cannot see the login screen when logged in",
    async ({ changesPage }) => {
      await mockManagerProcedures({
        page: changesPage.page,
        procedures: [
          {
            path: "getState",
            data: (data) => ({
              ...data,
              clientError: undefined,
            }),
          },
        ],
      });

      await changesPage.goto();
      await expect(changesPage.loginButton).not.toBeVisible();
      await expect(changesPage.notLoggedInTitle).not.toBeVisible();
      await expect(changesPage.notAuthorizedTitle).not.toBeVisible();
    },
  );

  test.run()(
    "I can see the login screen when logged out",
    async ({ changesPage }) => {
      await mockManagerProcedures({
        page: changesPage.page,
        procedures: [
          {
            path: "getState",
            data: (data) => ({
              ...data,
              clientError: {
                status: 401,
              },
            }),
          },
        ],
      });

      await changesPage.goto();
      await expect(changesPage.loginButton).toBeVisible();
      await expect(changesPage.notLoggedInTitle).toBeVisible();
    },
  );

  test.run()(
    "I can see the unauthorized screen when not authorized",
    async ({ changesPage }) => {
      await mockManagerProcedures({
        page: changesPage.page,
        procedures: [
          {
            path: "getState",
            data: (data) => ({
              ...data,
              clientError: {
                status: 403,
              },
            }),
          },
        ],
      });

      await changesPage.goto();
      await expect(changesPage.loginButton).not.toBeVisible();
      await expect(changesPage.notAuthorizedTitle).toBeVisible();
    },
  );

  test.run()(
    "I can see the empty state when I don't have any changes to push",
    async ({ changesPage }) => {
      await mockManagerProcedures({
        page: changesPage.page,
        procedures: [
          {
            path: "getState",
            data: (data) => ({
              ...data,
              libraries: generateLibraries({ nbSlices: 0 }),
              customTypes: [],
              remoteCustomTypes: [],
              remoteSlices: [],
              clientError: undefined,
            }),
          },
        ],
      });

      await changesPage.goto();
      await expect(changesPage.loginButton).not.toBeVisible();
      await expect(changesPage.blankSlateTitle).toBeVisible();
    },
  );

  test.run()(
    "I can see the changes I have to push",
    async ({ changesPage }) => {
      const types = generateTypes({ nbTypes: 1 });
      const customType = types[0] as CustomType;
      await mockManagerProcedures({
        page: changesPage.page,
        procedures: [
          {
            path: "getState",
            data: (data) => ({
              ...data,
              libraries: generateLibraries({ nbSlices: 0 }),
              customTypes: types,
              remoteCustomTypes: [],
              remoteSlices: [],
              clientError: undefined,
            }),
          },
        ],
      });

      await changesPage.goto();
      await expect(changesPage.loginButton).not.toBeVisible();
      await changesPage.checkCustomTypeName(
        customType.id,
        customType.label as string,
      );
      await changesPage.checkCustomTypeApiId(customType.id);
      await changesPage.checkCustomTypeStatus(customType.id, "New");
    },
  );

  test.run()("I can push the changes I have", async ({ changesPage }) => {
    await mockManagerProcedures({
      page: changesPage.page,
      procedures: [
        {
          path: "getState",
          data: (data) => ({
            ...data,
            libraries: generateLibraries({ nbSlices: 0 }),
            customTypes: generateTypes({ nbTypes: 1 }),
            remoteCustomTypes: [],
            remoteSlices: [],
            clientError: undefined,
          }),
        },
        {
          path: "prismicRepository.pushChanges",
          execute: false,
        },
      ],
    });

    await changesPage.goto();
    await expect(changesPage.loginButton).not.toBeVisible();
    await changesPage.pushChanges();
  });

  test.run()(
    "I can see an error when the push failed",
    async ({ changesPage }) => {
      await mockManagerProcedures({
        page: changesPage.page,
        procedures: [
          {
            path: "getState",
            data: (data) => ({
              ...data,
              libraries: generateLibraries({ nbSlices: 0 }),
              customTypes: generateTypes({ nbTypes: 1 }),
              remoteCustomTypes: [],
              remoteSlices: [],
              clientError: undefined,
            }),
          },
          {
            path: "prismicRepository.pushChanges",
            data: () => new Error("Error"),
            execute: false,
          },
        ],
      });

      await changesPage.goto();
      await expect(changesPage.loginButton).not.toBeVisible();
      await changesPage.pushChangesButton.click();
      await expect(changesPage.unknownErrorMessage).toBeVisible();
    },
  );

  test.run()(
    "I have to confirm the push when I reach a soft limit of deleted documents",
    async ({ changesPage }) => {
      await mockManagerProcedures({
        page: changesPage.page,
        procedures: [
          {
            path: "getState",
            data: (data) => ({
              ...data,
              libraries: generateLibraries({ nbSlices: 0 }),
              customTypes: generateTypes({ nbTypes: 1 }),
              remoteCustomTypes: [],
              remoteSlices: [],
              clientError: undefined,
            }),
          },
          {
            path: "prismicRepository.pushChanges",
            data: () => ({
              type: "SOFT",
              details: {
                customTypes: [],
              },
            }),
            execute: false,
          },
          {
            path: "prismicRepository.pushChanges",
            execute: false,
          },
        ],
      });

      await changesPage.goto();
      await expect(changesPage.loginButton).not.toBeVisible();
      await changesPage.pushChangesButton.click();
      await expect(changesPage.softLimitTitle).toBeVisible();
      await changesPage.confirmDeleteDocuments();
    },
  );

  test.run()(
    "I cannot push the changes when I reach a hard limit of deleted documents",
    async ({ changesPage }) => {
      await mockManagerProcedures({
        page: changesPage.page,
        procedures: [
          {
            path: "getState",
            data: (data) => ({
              ...data,
              libraries: generateLibraries({ nbSlices: 0 }),
              customTypes: generateTypes({ nbTypes: 1 }),
              remoteCustomTypes: [],
              remoteSlices: [],
              clientError: undefined,
            }),
          },
          {
            path: "prismicRepository.pushChanges",
            data: () => ({
              type: "HARD",
              details: {
                customTypes: [],
              },
            }),
            execute: false,
          },
          {
            path: "prismicRepository.pushChanges",
            execute: false,
          },
        ],
      });

      await changesPage.goto();
      await expect(changesPage.loginButton).not.toBeVisible();
      await changesPage.pushChangesButton.click();

      await expect(changesPage.hardLimitTitle).toBeVisible();
      await changesPage.hardLimitButton.click();
      await changesPage.checkPushedMessage();
    },
  );
});
