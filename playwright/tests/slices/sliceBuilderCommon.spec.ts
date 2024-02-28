import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import { generateRandomId } from "../../utils/generateRandomId";

test("I can add a new variation", async ({ slice, sliceBuilderPage }) => {
  await sliceBuilderPage.goto(slice.name);
  await expect(sliceBuilderPage.variationCards).toHaveCount(1);

  await sliceBuilderPage.openAddVariationDialog();
  const variationName = `Variation ${generateRandomId()}`;
  await sliceBuilderPage.addVariationDialog.addVariation(variationName);

  await expect(sliceBuilderPage.variationCards).toHaveCount(2);
  await expect(
    sliceBuilderPage.getVariationCard(slice.name, variationName),
  ).toBeVisible();
});

test("I can rename a variation", async ({ slice, sliceBuilderPage }) => {
  await sliceBuilderPage.goto(slice.name);

  const defaultVariationName = "Default";
  await sliceBuilderPage.openVariationActionMenu(
    slice.name,
    defaultVariationName,
    "Rename",
  );
  const newVariationName = `${defaultVariationName}Renamed`;
  await sliceBuilderPage.renameVariationDialog.renameVariation(
    newVariationName,
  );

  await expect(sliceBuilderPage.variationCards).toHaveCount(1);
  await expect(
    sliceBuilderPage.getVariationCard(slice.name, defaultVariationName),
  ).not.toBeVisible();
  await expect(
    sliceBuilderPage.getVariationCard(slice.name, newVariationName),
  ).toBeVisible();
});

test("I can delete a variation", async ({ slice, sliceBuilderPage }) => {
  await sliceBuilderPage.goto(slice.name);
  await sliceBuilderPage.openAddVariationDialog();
  const variationName = `Variation ${generateRandomId()}`;
  await sliceBuilderPage.addVariationDialog.addVariation(variationName);

  await sliceBuilderPage.openVariationActionMenu(
    slice.name,
    variationName,
    "Delete",
  );
  await sliceBuilderPage.deleteVariationDialog.deleteVariation();

  await expect(sliceBuilderPage.variationCards).toHaveCount(1);
  await expect(
    sliceBuilderPage.getVariationCard(slice.name, variationName),
  ).not.toBeVisible();
});

test.describe("Simulator tooltip", () => {
  test.use({ onboarded: false });

  test("I can close the simulator tooltip and it stays close", async ({
    slice,
    sliceBuilderPage,
  }) => {
    await sliceBuilderPage.goto(slice.name);

    // Simulator tooltip should open automatically
    await expect(sliceBuilderPage.simulateTooltipTitle).toBeVisible();
    await sliceBuilderPage.simulateTooltipCloseButton.click();
    await expect(sliceBuilderPage.simulateTooltipTitle).not.toBeVisible();

    await sliceBuilderPage.page.reload();
    await expect(sliceBuilderPage.getBreadcrumbLabel(slice.name)).toBeVisible();

    await expect(sliceBuilderPage.simulateTooltipTitle).not.toBeVisible();
  });
});

test("I can see my changes auto-saved", async ({ sliceBuilderPage, slice }) => {
  await sliceBuilderPage.goto(slice.name);
  await sliceBuilderPage.addField({
    type: "Rich Text",
    name: "My Rich Text",
    expectedId: "my_rich_text",
    zoneType: "static",
  });

  await expect(sliceBuilderPage.autoSaveStatusSaved).toBeVisible();
  await sliceBuilderPage.page.reload();
  await expect(sliceBuilderPage.autoSaveStatusSaved).toBeVisible();
});

test("I can see my changes being saved", async ({
  sliceBuilderPage,
  slice,
  procedures,
}) => {
  procedures.mock("slices.updateSlice", ({ data }) => data, {
    delay: 2000,
  });

  await sliceBuilderPage.goto(slice.name);
  await sliceBuilderPage.addField({
    type: "Rich Text",
    name: "My Rich Text",
    expectedId: "my_rich_text",
    zoneType: "static",
  });

  await expect(sliceBuilderPage.autoSaveStatusSaving).toBeVisible();
  await expect(sliceBuilderPage.autoSaveStatusSaved).toBeVisible();
  await sliceBuilderPage.page.reload();
  await expect(sliceBuilderPage.autoSaveStatusSaved).toBeVisible();
});

test("I can see that my changes failed to save and I can retry", async ({
  sliceBuilderPage,
  slice,
  procedures,
}) => {
  procedures.mock("slices.updateSlice", () => ({ errors: [{}] }), {
    execute: false,
    times: 1,
  });

  await sliceBuilderPage.goto(slice.name);
  await sliceBuilderPage.addField({
    type: "Rich Text",
    name: "My Rich Text",
    expectedId: "my_rich_text",
    zoneType: "static",
  });

  await expect(sliceBuilderPage.autoSaveStatusError).toBeVisible();
  await sliceBuilderPage.autoSaveRetryButton.click();
  await expect(sliceBuilderPage.autoSaveStatusSaving).toBeVisible();
  await expect(sliceBuilderPage.autoSaveStatusSaved).toBeVisible();
  await sliceBuilderPage.page.reload();
  await expect(sliceBuilderPage.autoSaveStatusSaved).toBeVisible();
});

test("I cannot see a save happening when I first load the page", async ({
  sliceBuilderPage,
  slice,
  procedures,
}) => {
  procedures.mock("slices.updateSlice", ({ data }) => data, {
    delay: 2000,
  });

  await sliceBuilderPage.goto(slice.name);
  await expect(sliceBuilderPage.autoSaveStatusSaving).not.toBeVisible({
    // As soon as it's visible it's a problem
    timeout: 1,
  });
});

test("I can add a screenshot", async ({ slice, sliceBuilderPage }) => {
  await sliceBuilderPage.goto(slice.name);

  await expect(sliceBuilderPage.noScreenshotMessage).toBeVisible();
  await sliceBuilderPage.openVariationActionMenu(
    slice.name,
    "Default",
    "Update screenshot",
  );

  await expect(
    sliceBuilderPage.updateScreenshotDialog.screenshotPlaceholder,
  ).toBeVisible();
  await sliceBuilderPage.updateScreenshotDialog.updateScreenshot(
    "slice-screenshot-imageLeft",
  );
  await expect(
    sliceBuilderPage.updateScreenshotDialog.screenshotPlaceholder,
  ).not.toBeVisible();

  await sliceBuilderPage.page.reload();
  await expect(sliceBuilderPage.breadcrumb).toBeVisible();
  await expect(sliceBuilderPage.noScreenshotMessage).not.toBeVisible();
});
