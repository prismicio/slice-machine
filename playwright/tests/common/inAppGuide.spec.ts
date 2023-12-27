import { expect } from "@playwright/test";

import { test } from "../../fixtures";

test.run({ onboarded: false })(
  "I can see the in-app guide open by default",
  async ({ sliceMachinePage }) => {
    await sliceMachinePage.gotoDefaultPage();

    await expect(sliceMachinePage.inAppGuideDialog.title).toBeVisible();
  },
);

test.run({ onboarded: false })(
  "I can close the in-app guide",
  async ({ sliceMachinePage }) => {
    await sliceMachinePage.gotoDefaultPage();

    await expect(sliceMachinePage.inAppGuideDialog.title).toBeVisible();
    await sliceMachinePage.inAppGuideDialog.closeButton.click();
    await expect(sliceMachinePage.inAppGuideDialog.title).not.toBeVisible();

    await sliceMachinePage.page.reload();
    await expect(sliceMachinePage.inAppGuideDialog.title).not.toBeVisible();
  },
);

test.run({ onboarded: false })(
  "I can see the in-app guide on different pages",
  async ({ sliceMachinePage, slicesListPage, customTypesTablePage }) => {
    await slicesListPage.goto();
    await expect(sliceMachinePage.inAppGuideDialog.title).toBeVisible();

    await customTypesTablePage.goto();
    await expect(sliceMachinePage.inAppGuideDialog.title).toBeVisible();
  },
);
