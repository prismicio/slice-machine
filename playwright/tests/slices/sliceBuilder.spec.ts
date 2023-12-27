import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import { generateRandomId } from "../../utils/generateRandomId";

test.run()("I can add a new variation", async ({ slice, sliceBuilderPage }) => {
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

test.run()("I can rename a variation", async ({ slice, sliceBuilderPage }) => {
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

test.run()("I can delete a variation", async ({ slice, sliceBuilderPage }) => {
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

test.run()(
  "I can add a static field to the builder",
  async ({ slice, sliceBuilderPage }) => {
    await sliceBuilderPage.goto(slice.name);

    await expect(sliceBuilderPage.staticZoneListItem).toHaveCount(0);

    await sliceBuilderPage.addStaticField(
      "Rich Text",
      "Description",
      "description",
    );

    await expect(sliceBuilderPage.staticZoneListItem).toHaveCount(1);
  },
);

test.run({ onboarded: false })(
  "I can close the simulator tooltip and it stays close",
  async ({ slice, sliceBuilderPage }) => {
    await sliceBuilderPage.goto(slice.name);

    // Simulator tooltip should open automatically
    await expect(sliceBuilderPage.simulateTooltipTitle).toBeVisible();
    await sliceBuilderPage.simulateTooltipCloseButton.click();
    await expect(sliceBuilderPage.simulateTooltipTitle).not.toBeVisible();

    await sliceBuilderPage.page.reload();
    await expect(sliceBuilderPage.getBreadcrumbLabel(slice.name)).toBeVisible();

    await expect(sliceBuilderPage.simulateTooltipTitle).not.toBeVisible();
  },
);
