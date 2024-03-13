import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import { generateRandomId } from "../../utils/generateRandomId";

test("I can enable or disable the slice zone", async ({
  customTypesBuilderPage,
  reusableCustomType,
}) => {
  await customTypesBuilderPage.goto(reusableCustomType.name);

  await expect(customTypesBuilderPage.sliceZoneSwitch).not.toBeChecked();
  await customTypesBuilderPage.sliceZoneSwitch.click();
  await expect(customTypesBuilderPage.sliceZoneSwitch).toBeChecked();

  await customTypesBuilderPage.sliceZoneSwitch.click();
  await customTypesBuilderPage.deleteSliceZoneDialog.deleteSliceZone();
  await expect(customTypesBuilderPage.sliceZoneSwitch).not.toBeChecked();
});

test("I cannot add slices by default", async ({
  customTypesBuilderPage,
  reusableCustomType,
}) => {
  await customTypesBuilderPage.goto(reusableCustomType.name);
  await expect(customTypesBuilderPage.sliceZoneSwitch).not.toBeChecked();
});

test("I cannot add slices in a new tab by default", async ({
  customTypesBuilderPage,
  reusableCustomType,
}) => {
  await customTypesBuilderPage.goto(reusableCustomType.name);
  await customTypesBuilderPage.addTabButton.click();
  await customTypesBuilderPage.addTabDialog.createTab("New tab");
  await customTypesBuilderPage.checkIfTabIsActive("New tab");

  await expect(customTypesBuilderPage.sliceZoneSwitch).not.toBeChecked();
});

test("I can add slices with a template from the add dropdown", async ({
  customTypesBuilderPage,
  reusableCustomType,
}) => {
  const sliceTemplates = [
    "Hero",
    "CustomerLogos",
    "AlternateGrid",
    "CallToAction",
  ];

  await customTypesBuilderPage.goto(reusableCustomType.name);
  await customTypesBuilderPage.sliceZoneSwitch.click();

  await customTypesBuilderPage.sliceZoneAddDropdown.click();
  await customTypesBuilderPage.sliceZoneAddDropdownUseTemplateAction.click();
  await customTypesBuilderPage.useTemplateSlicesDialog.useTemplates(
    sliceTemplates,
  );

  for (const slice of sliceTemplates) {
    await expect(
      customTypesBuilderPage.getSliceZoneSharedSliceCard(slice),
    ).toBeVisible();
  }
});

test("I can add a slice with an existing slice from the add dropdown", async ({
  customTypesBuilderPage,
  reusableCustomType,
  slice,
}) => {
  await customTypesBuilderPage.goto(reusableCustomType.name);
  await customTypesBuilderPage.sliceZoneSwitch.click();

  await customTypesBuilderPage.sliceZoneAddDropdown.click();
  await customTypesBuilderPage.sliceZoneAddDropdownSelectExistingAction.click();
  await customTypesBuilderPage.selectExistingSlicesDialog.selectExistingSlices([
    slice.name,
  ]);

  await expect(
    customTypesBuilderPage.getSliceZoneSharedSliceCard(slice.name),
  ).toBeVisible();
});

test("I can add a slice by creating a new slice from the add dropdown", async ({
  customTypesBuilderPage,
  reusableCustomType,
}) => {
  await customTypesBuilderPage.goto(reusableCustomType.name);
  await customTypesBuilderPage.sliceZoneSwitch.click();

  await customTypesBuilderPage.sliceZoneAddDropdown.click();
  await customTypesBuilderPage.sliceZoneAddDropdownCreateNewAction.click();
  const name = "NewSlice" + generateRandomId();
  await customTypesBuilderPage.createSliceDialog.createSlice(name, "sliceZone");

  await expect(
    customTypesBuilderPage.getSliceZoneSharedSliceCard(name),
  ).toBeVisible();
});

test("I can add slices with a template from the blank slate", async ({
  customTypesBuilderPage,
  reusableCustomType,
}) => {
  const sliceTemplates = [
    "Hero",
    "CustomerLogos",
    "AlternateGrid",
    "CallToAction",
  ];

  await customTypesBuilderPage.goto(reusableCustomType.name);
  await customTypesBuilderPage.sliceZoneSwitch.click();

  await customTypesBuilderPage.sliceZoneBlankSlateUseTemplateAction.click();
  await customTypesBuilderPage.useTemplateSlicesDialog.useTemplates(
    sliceTemplates,
  );

  for (const slice of sliceTemplates) {
    await expect(
      customTypesBuilderPage.getSliceZoneSharedSliceCard(slice),
    ).toBeVisible();
  }
});

test("I can add a slice with an existing slice from the blank slate", async ({
  customTypesBuilderPage,
  reusableCustomType,
  slice,
}) => {
  await customTypesBuilderPage.goto(reusableCustomType.name);
  await customTypesBuilderPage.sliceZoneSwitch.click();

  await customTypesBuilderPage.sliceZoneBlankSlateSelectExistingAction.click();
  await customTypesBuilderPage.selectExistingSlicesDialog.selectExistingSlices([
    slice.name,
  ]);

  await expect(
    customTypesBuilderPage.getSliceZoneSharedSliceCard(slice.name),
  ).toBeVisible();
});

test("I can add a slice by creating a new slice the blank slate", async ({
  customTypesBuilderPage,
  reusableCustomType,
}) => {
  await customTypesBuilderPage.goto(reusableCustomType.name);
  await customTypesBuilderPage.sliceZoneSwitch.click();

  await customTypesBuilderPage.sliceZoneBlankSlateCreateNewAction.click();
  const name = "NewSlice" + generateRandomId();
  await customTypesBuilderPage.createSliceDialog.createSlice(name, "sliceZone");

  await expect(
    customTypesBuilderPage.getSliceZoneSharedSliceCard(name),
  ).toBeVisible();
});

test("I can remove a slice from the slice zone", async ({
  customTypesBuilderPage,
  reusableCustomType,
  slice,
}) => {
  await customTypesBuilderPage.goto(reusableCustomType.name);
  await customTypesBuilderPage.sliceZoneSwitch.click();

  await customTypesBuilderPage.sliceZoneAddDropdown.click();
  await customTypesBuilderPage.sliceZoneAddDropdownSelectExistingAction.click();
  await customTypesBuilderPage.selectExistingSlicesDialog.selectExistingSlices([
    slice.name,
  ]);
  await customTypesBuilderPage.removeSliceButton.click();

  await expect(
    customTypesBuilderPage.getSliceZoneSharedSliceCard(slice.name),
  ).not.toBeVisible();
});
