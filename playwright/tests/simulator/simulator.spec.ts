import { expect } from "@playwright/test";

import { test } from "../../fixtures";

test("I can open the simulator and save mock content", async ({
  pageTypesBuilderPage,
  reusablePageType,
  sliceBuilderPage,
  simulatorPage,
}) => {
  await pageTypesBuilderPage.goto(reusablePageType.name);

  await pageTypesBuilderPage.sliceZoneAddDropdown.click();
  await pageTypesBuilderPage.sliceZoneAddDropdownUseTemplateAction.click();
  await pageTypesBuilderPage.useTemplateSlicesDialog.useTemplates(["Hero"]);
  await pageTypesBuilderPage.getSliceZoneSharedSliceCard("Hero").click();

  const newTabPromise = pageTypesBuilderPage.page.waitForEvent("popup");
  await sliceBuilderPage.simulateButton.click();

  const newTab = await newTabPromise;
  await newTab.waitForLoadState();
  await pageTypesBuilderPage.page.goto(newTab.url());

  await simulatorPage
    .getHeadingFieldByContent("Build a website that keeps getting better")
    .fill("My new name");
  await simulatorPage.saveMockButton.click();

  await expect(simulatorPage.saveMockSuccessMessage).toBeVisible();
  await simulatorPage.page.reload();

  await expect(
    simulatorPage.getHeadingFieldByContent("My new name"),
  ).toBeVisible();
});
