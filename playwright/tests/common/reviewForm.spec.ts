import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import { generateLibraries, generateTypes } from "../../mocks";

test.use({
  onboarded: false,
  reduxStorage: {
    lastSyncChange: new Date(new Date().getTime() - 3600000).getTime(),
  },
});

test("I can close the review dialog", async ({
  sliceMachinePage,
  procedures,
}) => {
  const libraries = generateLibraries({ slicesCount: 1 });

  // We mock a page type with a slice that is a requirement for the review dialog
  procedures.mock("getState", ({ data }) => ({
    ...(data as Record<string, unknown>),
    libraries,
    customTypes: generateTypes({ typesCount: 1, libraries }),
    remoteCustomTypes: [],
    remoteSlices: [],
    clientError: undefined,
  }));

  await sliceMachinePage.gotoDefaultPage();

  await sliceMachinePage.reviewDialog.closeButton.click();

  // We verify that the review dialog is not displayed anymore
  await sliceMachinePage.page.reload();
  await expect(sliceMachinePage.reviewDialog.title).not.toBeVisible();
});
