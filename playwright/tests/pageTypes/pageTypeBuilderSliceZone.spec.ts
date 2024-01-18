import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import { generateRandomId } from "../../utils/generateRandomId";

test.run()(
  "I can enable or disable the slice zone",
  async ({ pageTypesBuilderPage, reusablePageType }) => {
    await pageTypesBuilderPage.goto(reusablePageType.name);

    await pageTypesBuilderPage.addTabButton.click();
    await pageTypesBuilderPage.addTabDialog.createTab("New tab");

    await expect(pageTypesBuilderPage.sliceZoneSwitch).not.toBeChecked();
    await pageTypesBuilderPage.sliceZoneSwitch.click();
    await expect(pageTypesBuilderPage.sliceZoneSwitch).toBeChecked();

    await pageTypesBuilderPage.sliceZoneSwitch.click();
    await pageTypesBuilderPage.deleteSliceZoneDialog.deleteSliceZone();
    await expect(pageTypesBuilderPage.sliceZoneSwitch).not.toBeChecked();
  },
);

test.run()(
  "I cannot disable the slice zone on the Main tab",
  async ({ pageTypesBuilderPage, reusablePageType }) => {
    await pageTypesBuilderPage.goto(reusablePageType.name);

    await pageTypesBuilderPage.checkIfTabIsActive("Main");
    await expect(pageTypesBuilderPage.sliceZoneSwitch).not.toBeVisible();
  },
);

test.run()(
  "I cannot add slices in SEO & Metadata tab by default",
  async ({ pageTypesBuilderPage, reusablePageType }) => {
    await pageTypesBuilderPage.goto(reusablePageType.name);
    await pageTypesBuilderPage.openTab("SEO & Metadata");

    await expect(pageTypesBuilderPage.sliceZoneSwitch).not.toBeChecked();
  },
);

test.run()(
  "I cannot add slices in a new tab by default",
  async ({ pageTypesBuilderPage, reusablePageType }) => {
    await pageTypesBuilderPage.goto(reusablePageType.name);
    await pageTypesBuilderPage.addTabButton.click();
    await pageTypesBuilderPage.addTabDialog.createTab("New tab");
    await pageTypesBuilderPage.checkIfTabIsActive("New tab");

    await expect(pageTypesBuilderPage.sliceZoneSwitch).not.toBeChecked();
  },
);

test.run()(
  "I can add slices with a template from the add dropdown",
  async ({ pageTypesBuilderPage, reusablePageType }) => {
    const sliceTemplates = [
      "Hero",
      "CustomerLogos",
      "AlternateGrid",
      "CallToAction",
    ];

    await pageTypesBuilderPage.goto(reusablePageType.name);

    await pageTypesBuilderPage.sliceZoneAddDropdown.click();
    await pageTypesBuilderPage.sliceZoneAddDropdownUseTemplateAction.click();
    await pageTypesBuilderPage.useTemplateSlicesDialog.useTemplates(
      sliceTemplates,
    );

    for (const slice of sliceTemplates) {
      await expect(
        pageTypesBuilderPage.getSliceZoneSharedSliceCard(slice),
      ).toBeVisible();
    }
  },
);

test.run()(
  "I can add a slice with an existing slice from the add dropdown",
  async ({ pageTypesBuilderPage, reusablePageType, slice }) => {
    await pageTypesBuilderPage.goto(reusablePageType.name);

    await pageTypesBuilderPage.sliceZoneAddDropdown.click();
    await pageTypesBuilderPage.sliceZoneAddDropdownSelectExistingAction.click();
    await pageTypesBuilderPage.selectExistingSlicesDialog.selectExistingSlices([
      slice.name,
    ]);

    await expect(
      pageTypesBuilderPage.getSliceZoneSharedSliceCard(slice.name),
    ).toBeVisible();
  },
);

test.run()(
  "I can add a slice by creating a new slice from the add dropdown",
  async ({ pageTypesBuilderPage, reusablePageType }) => {
    await pageTypesBuilderPage.goto(reusablePageType.name);

    await pageTypesBuilderPage.sliceZoneAddDropdown.click();
    await pageTypesBuilderPage.sliceZoneAddDropdownCreateNewAction.click();
    const name = "NewSlice" + generateRandomId();
    await pageTypesBuilderPage.createSliceDialog.createSlice(name, "sliceZone");

    await expect(
      pageTypesBuilderPage.getSliceZoneSharedSliceCard(name),
    ).toBeVisible();
  },
);

test.run()(
  "I can add slices with a template from the blank slate",
  async ({ pageTypesBuilderPage, reusablePageType }) => {
    const sliceTemplates = [
      "Hero",
      "CustomerLogos",
      "AlternateGrid",
      "CallToAction",
    ];

    await pageTypesBuilderPage.goto(reusablePageType.name);

    await pageTypesBuilderPage.sliceZoneBlankSlateUseTemplateAction.click();
    await pageTypesBuilderPage.useTemplateSlicesDialog.useTemplates(
      sliceTemplates,
    );

    for (const slice of sliceTemplates) {
      await expect(
        pageTypesBuilderPage.getSliceZoneSharedSliceCard(slice),
      ).toBeVisible();
    }
  },
);

test.run()(
  "I can add a slice with an existing slice from the blank slate",
  async ({ pageTypesBuilderPage, reusablePageType, slice }) => {
    await pageTypesBuilderPage.goto(reusablePageType.name);

    await pageTypesBuilderPage.sliceZoneBlankSlateSelectExistingAction.click();
    await pageTypesBuilderPage.selectExistingSlicesDialog.selectExistingSlices([
      slice.name,
    ]);

    await expect(
      pageTypesBuilderPage.getSliceZoneSharedSliceCard(slice.name),
    ).toBeVisible();
  },
);

test.run()(
  "I can add a slice by creating a new slice the blank slate",
  async ({ pageTypesBuilderPage, reusablePageType }) => {
    await pageTypesBuilderPage.goto(reusablePageType.name);

    await pageTypesBuilderPage.sliceZoneBlankSlateCreateNewAction.click();
    const name = "NewSlice" + generateRandomId();
    await pageTypesBuilderPage.createSliceDialog.createSlice(name, "sliceZone");

    await expect(
      pageTypesBuilderPage.getSliceZoneSharedSliceCard(name),
    ).toBeVisible();
  },
);

test.run()(
  "I can remove a slice from the slice zone",
  async ({ pageTypesBuilderPage, reusablePageType, slice }) => {
    await pageTypesBuilderPage.goto(reusablePageType.name);

    await pageTypesBuilderPage.sliceZoneAddDropdown.click();
    await pageTypesBuilderPage.sliceZoneAddDropdownSelectExistingAction.click();
    await pageTypesBuilderPage.selectExistingSlicesDialog.selectExistingSlices([
      slice.name,
    ]);
    await pageTypesBuilderPage.removeSliceButton.click();

    await expect(
      pageTypesBuilderPage.getSliceZoneSharedSliceCard(slice.name),
    ).not.toBeVisible();
  },
);
