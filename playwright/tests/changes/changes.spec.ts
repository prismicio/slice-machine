import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import { mockManagerProcedures } from "../../utils";
import { emptyLibraries, simpleCustomType } from "../../mocks";

test.describe("Changes", () => {
  test.run({ loggedIn: true })(
    "I cannot see the login screen when logged in",
    async ({ changesPage }) => {
      await changesPage.goto();
      await expect(changesPage.loginButton).not.toBeVisible();
      await expect(changesPage.notLoggedInTitle).not.toBeVisible();
      await expect(changesPage.notAuthorizedTitle).not.toBeVisible();
    },
  );

  test.run()(
    "I can see the login screen when logged out",
    async ({ changesPage }) => {
      await changesPage.goto();
      await expect(changesPage.loginButton).toBeVisible();
      await expect(changesPage.notLoggedInTitle).toBeVisible();
    },
  );

  test.run({ loggedIn: true })(
    "I can see the unauthorized screen when not authorized",
    async ({ changesPage }) => {
      await mockManagerProcedures({
        page: changesPage.page,
        procedures: [
          {
            path: "getState",
            data: (data) => ({
              ...(data as Record<string, unknown>),
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

  test.run({ loggedIn: true })(
    "I can see the empty state when I don't have any changes to push",
    async ({ changesPage }) => {
      await mockManagerProcedures({
        page: changesPage.page,
        procedures: [
          {
            path: "getState",
            data: (data) => ({
              ...(data as Record<string, unknown>),
              libraries: emptyLibraries,
              customTypes: [],
              remoteCustomTypes: [],
              remoteSlices: [],
            }),
          },
        ],
      });

      await changesPage.goto();
      await expect(changesPage.loginButton).not.toBeVisible();
      await expect(changesPage.blankSlateTitle).toBeVisible();
    },
  );

  test.run({ loggedIn: true })(
    "I can see the changes I have to push",
    async ({ changesPage }) => {
      await mockManagerProcedures({
        page: changesPage.page,
        procedures: [
          {
            path: "getState",
            data: (data) => ({
              ...(data as Record<string, unknown>),
              libraries: emptyLibraries,
              customTypes: [simpleCustomType],
              remoteCustomTypes: [],
              remoteSlices: [],
            }),
          },
        ],
      });

      await changesPage.goto();
      await expect(changesPage.loginButton).not.toBeVisible();
      await changesPage.checkCustomTypeName(
        simpleCustomType.id,
        simpleCustomType.label,
      );
      await changesPage.checkCustomTypeApiId(simpleCustomType.id);
      await changesPage.checkCustomTypeStatus(simpleCustomType.id, "New");
    },
  );

  test.run({ loggedIn: true })(
    "I can push the changes I have",
    async ({ changesPage }) => {
      await mockManagerProcedures({
        page: changesPage.page,
        procedures: [
          {
            path: "getState",
            data: (data) => ({
              ...(data as Record<string, unknown>),
              libraries: emptyLibraries,
              customTypes: [simpleCustomType],
              remoteCustomTypes: [],
              remoteSlices: [],
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
    },
  );
});
