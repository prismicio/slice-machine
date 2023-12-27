import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import { generateLibraries, generateTypes } from "../../mocks";

test.run({
  onboarded: false,
  reduxStorage: {
    lastSyncChange: new Date(new Date().getTime() - 3600000).getTime(),
  },
})(
  "I can write a review after onboarding",
  async ({ sliceMachinePage, procedures }) => {
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

    // We close the in app guide to display the review dialog
    await sliceMachinePage.inAppGuideDialog.closeButton.click();

    await sliceMachinePage.reviewDialog.submitReview({
      rating: 4,
      message: "Great job!",
    });

    // We verify that the review dialog is not displayed anymore
    await sliceMachinePage.page.reload();
    await expect(sliceMachinePage.reviewDialog.title).not.toBeVisible();
  },
);

test.run({
  onboarded: false,
  reduxStorage: {
    lastSyncChange: new Date(new Date().getTime() - 3600000).getTime(),
  },
})(
  "I can write a review after creating enough models",
  async ({ sliceMachinePage, procedures }) => {
    const libraries = generateLibraries({ slicesCount: 6 });

    // We mock a page type with a slice that is a requirement for the review dialog
    procedures.mock(
      "getState",
      ({ data }) => ({
        ...(data as Record<string, unknown>),
        libraries,
        customTypes: generateTypes({ typesCount: 1, libraries }),
        remoteCustomTypes: [],
        remoteSlices: [],
        clientError: undefined,
      }),
      { times: 2 },
    );

    await sliceMachinePage.gotoDefaultPage();

    // We close the in app guide so the review dialog can be displayed
    await sliceMachinePage.inAppGuideDialog.closeButton.click();

    // We close the first review for onboarding
    await sliceMachinePage.reviewDialog.closeButton.click();

    procedures.mock("getState", ({ data }) => ({
      ...(data as Record<string, unknown>),
      libraries,
      customTypes: generateTypes({ typesCount: 6, libraries }),
      remoteCustomTypes: [],
      remoteSlices: [],
      clientError: undefined,
    }));

    // We reload and mock with 6 types to trigger the advanced review dialog
    await sliceMachinePage.page.reload();

    await sliceMachinePage.reviewDialog.submitReview({
      rating: 5,
      message: "I love Slice Machine!",
    });

    // We verify that the review dialog is not displayed anymore
    await sliceMachinePage.page.reload();
    await expect(sliceMachinePage.reviewDialog.title).not.toBeVisible();
  },
);

test.run({
  onboarded: false,
  reduxStorage: {
    lastSyncChange: new Date(new Date().getTime() - 3600000).getTime(),
  },
})(
  "I can close the review dialog",
  async ({ sliceMachinePage, procedures }) => {
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

    // We close the in app guide to display the review dialog
    await sliceMachinePage.inAppGuideDialog.closeButton.click();

    await sliceMachinePage.reviewDialog.closeButton.click();

    // We verify that the review dialog is not displayed anymore
    await sliceMachinePage.page.reload();
    await expect(sliceMachinePage.reviewDialog.title).not.toBeVisible();
  },
);
