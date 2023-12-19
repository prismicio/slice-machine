import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import { mockManagerProcedures } from "../../utils";
import { generateLibraries, generateTypes } from "../../mocks";

test.describe("Review form", () => {
  test.run({
    onboarded: false,
    reduxStorage: {
      lastSyncChange: new Date(new Date().getTime() - 3600000).getTime(),
    },
  })("I can write a review after onboarding", async ({ sliceMachinePage }) => {
    const libraries = generateLibraries({ nbSlices: 1 });

    // We mock a page type with a slice that is a requirement for the review dialog
    await mockManagerProcedures({
      page: sliceMachinePage.page,
      procedures: [
        {
          path: "getState",
          data: (data) => ({
            ...data,
            libraries,
            customTypes: generateTypes({ nbTypes: 1, libraries }),
            remoteCustomTypes: [],
            remoteSlices: [],
            clientError: undefined,
          }),
        },
      ],
    });

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
  });

  test.run({
    onboarded: false,
    reduxStorage: {
      lastSyncChange: new Date(new Date().getTime() - 3600000).getTime(),
    },
  })(
    "I can write a review after creating enough models",
    async ({ sliceMachinePage }) => {
      const libraries = generateLibraries({ nbSlices: 6 });

      // We mock a page type with a slice that is a requirement for the review dialog
      await mockManagerProcedures({
        page: sliceMachinePage.page,
        procedures: [
          {
            path: "getState",
            data: (data) => ({
              ...data,
              libraries,
              customTypes: generateTypes({ nbTypes: 1, libraries }),
              remoteCustomTypes: [],
              remoteSlices: [],
              clientError: undefined,
            }),
          },
          {
            path: "getState",
            data: (data) => ({
              ...data,
              libraries,
              customTypes: generateTypes({ nbTypes: 1, libraries }),
              remoteCustomTypes: [],
              remoteSlices: [],
              clientError: undefined,
            }),
          },
          {
            path: "getState",
            data: (data) => ({
              ...data,
              libraries,
              customTypes: generateTypes({ nbTypes: 6, libraries }),
              remoteCustomTypes: [],
              remoteSlices: [],
              clientError: undefined,
            }),
          },
        ],
      });

      await sliceMachinePage.gotoDefaultPage();

      // We close the in app guide so the review dialog can be displayed
      await sliceMachinePage.inAppGuideDialog.closeButton.click();

      // We close the first review for onboarding
      await sliceMachinePage.reviewDialog.closeButton.click();

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
  })("I can close the review dialog", async ({ sliceMachinePage }) => {
    const libraries = generateLibraries({ nbSlices: 1 });

    // We mock a page type with a slice that is a requirement for the review dialog
    await mockManagerProcedures({
      page: sliceMachinePage.page,
      procedures: [
        {
          path: "getState",
          data: (data) => ({
            ...data,
            libraries,
            customTypes: generateTypes({ nbTypes: 1, libraries }),
            remoteCustomTypes: [],
            remoteSlices: [],
            clientError: undefined,
          }),
        },
      ],
    });

    await sliceMachinePage.gotoDefaultPage();

    // We close the in app guide to display the review dialog
    await sliceMachinePage.inAppGuideDialog.closeButton.click();

    await sliceMachinePage.reviewDialog.closeButton.click();

    // We verify that the review dialog is not displayed anymore
    await sliceMachinePage.page.reload();
    await expect(sliceMachinePage.reviewDialog.title).not.toBeVisible();
  });
});
