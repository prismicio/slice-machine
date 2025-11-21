import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import { generateLibraries } from "../../mocks";
import { generateRandomId } from "../../utils/generateRandomId";

test("I can create a slice", async ({ sliceBuilderPage, slicesListPage }) => {
  await slicesListPage.goto();
  await slicesListPage.addSliceDropdown.click();
  await slicesListPage.addSliceDropdownCreateNewAction.click();

  const sliceName = "Slice" + generateRandomId();
  await slicesListPage.createSliceDialog.createSlice(sliceName);

  await sliceBuilderPage.checkBreadcrumb(sliceName);

  await expect(sliceBuilderPage.staticZoneListItem).toHaveCount(0);
  await expect(sliceBuilderPage.repeatableZoneListItem).toHaveCount(0);
});

// See: https://github.com/prismicio/slice-machine/issues/599
test("I can only create a slice by using Pascal case for the slice name", async ({
  slicesListPage,
}) => {
  await slicesListPage.goto();
  await slicesListPage.addSliceDropdown.click();
  await slicesListPage.addSliceDropdownCreateNewAction.click();

  const { nameInput, submitButton } = slicesListPage.createSliceDialog;

  await nameInput.fill("Invalid Slice Name");
  await expect(submitButton).toBeDisabled();

  await nameInput.clear();
  await nameInput.fill("Invalid_slice_name");
  await expect(submitButton).toBeDisabled();

  await nameInput.clear();
  await nameInput.fill("123SliceName");
  await expect(submitButton).toBeDisabled();

  await nameInput.clear();
  await nameInput.fill("ValidSliceName");
  await expect(submitButton).toBeEnabled();
});

test("I cannot create a slice with a name that already exists", async ({
  slicesListPage,
  slice,
}) => {
  await slicesListPage.goto();
  await slicesListPage.addSliceDropdown.click();
  await slicesListPage.addSliceDropdownCreateNewAction.click();

  const { nameInput, submitButton } = slicesListPage.createSliceDialog;

  await nameInput.fill(slice.name);
  await expect(submitButton).toBeDisabled();
  await submitButton.click({ force: true });
  await expect(
    slicesListPage.createSliceDialog.sliceAlreadyExistMessage,
  ).toBeVisible();
});

test("I can rename a slice", async ({
  slice,
  sliceBuilderPage,
  slicesListPage,
}) => {
  await slicesListPage.goto();
  await slicesListPage.openActionMenu(slice.name, "Rename");

  const newSliceName = `${slice.name}Renamed`;
  await slicesListPage.renameSliceDialog.renameSlice(newSliceName);

  // TODO(DT-1802): Production BUG - Sometimes after a rename, old slice name is still visible in the list
  await slicesListPage.page.reload();

  await expect(slicesListPage.getCard(slice.name)).not.toBeVisible();
  await expect(slicesListPage.getCard(newSliceName)).toBeVisible();
  await slicesListPage.clickCard(newSliceName);

  await sliceBuilderPage.checkBreadcrumb(newSliceName);
});

// See: https://github.com/prismicio/slice-machine/issues/791
test("I can only rename a slice by using Pascal case for the slice name", async ({
  slicesListPage,
  slice,
}) => {
  await slicesListPage.goto();
  await slicesListPage.openActionMenu(slice.name, "Rename");

  const { nameInput, submitButton } = slicesListPage.renameSliceDialog;

  await nameInput.clear();
  await nameInput.fill("Invalid Slice Name");
  await expect(submitButton).toBeDisabled();

  await nameInput.clear();
  await nameInput.fill("Invalid_slice_name");
  await expect(submitButton).toBeDisabled();

  await nameInput.clear();
  await nameInput.fill("123SliceName");
  await expect(submitButton).toBeDisabled();

  await nameInput.clear();
  await nameInput.fill("ValidSliceName");
  await expect(submitButton).toBeEnabled();
});

test("I can delete a slice", async ({ slice, slicesListPage }) => {
  await slicesListPage.goto();
  await slicesListPage.openActionMenu(slice.name, "Delete");

  await slicesListPage.deleteSliceDialog.deleteSlice(slice.name);

  // TODO(DT-1802): Production BUG - Sometimes after a delete, slice is still visible in the list
  await slicesListPage.page.reload();

  await expect(slicesListPage.getCard(slice.name)).not.toBeVisible();
  await slicesListPage.page.reload();
  await expect(slicesListPage.getCard(slice.name)).not.toBeVisible();
});

test("I cannot create a slice with a name starting with a number", async ({
  slicesListPage,
}) => {
  await slicesListPage.goto();
  await slicesListPage.addSliceDropdown.click();
  await slicesListPage.addSliceDropdownCreateNewAction.click();

  const sliceName = "1Slice" + generateRandomId();
  await expect(slicesListPage.createSliceDialog.title).toBeVisible();
  await slicesListPage.createSliceDialog.nameInput.fill(sliceName);

  await expect(slicesListPage.createSliceDialog.submitButton).toBeDisabled();
});

test("I cannot rename a slice with a name starting with a number", async ({
  slice,
  slicesListPage,
}) => {
  await slicesListPage.goto();
  await slicesListPage.openActionMenu(slice.name, "Rename");

  const newSliceName = `1${slice.name}Renamed`;
  await expect(slicesListPage.renameSliceDialog.title).toBeVisible();
  await slicesListPage.renameSliceDialog.nameInput.fill(newSliceName);
  await expect(slicesListPage.renameSliceDialog.submitButton).toBeDisabled();
});

test("I cannot create a slice with a restricted name ", async ({
  slicesListPage,
}) => {
  await slicesListPage.goto();
  await slicesListPage.addSliceDropdown.click();
  await slicesListPage.addSliceDropdownCreateNewAction.click();

  const { nameInput, submitButton } = slicesListPage.createSliceDialog;

  await nameInput.fill("components");
  await expect(submitButton).toBeDisabled();
  await nameInput.fill("update");
  await expect(submitButton).toBeDisabled();
  await nameInput.fill("insert");
  await expect(submitButton).toBeDisabled();
});

test("I cannot create two slices with the same name", async ({
  sliceBuilderPage,
  slicesListPage,
}) => {
  await slicesListPage.goto();
  await slicesListPage.addSliceDropdown.click();
  await slicesListPage.addSliceDropdownCreateNewAction.click();

  const sliceName = "Slice" + generateRandomId();
  await slicesListPage.createSliceDialog.createSlice(sliceName);
  await sliceBuilderPage.checkBreadcrumb(sliceName);

  await slicesListPage.goto();
  await slicesListPage.addSliceDropdown.click();
  await slicesListPage.addSliceDropdownCreateNewAction.click();
  await expect(slicesListPage.createSliceDialog.title).toBeVisible();
  await slicesListPage.createSliceDialog.nameInput.fill(sliceName);
  await expect(slicesListPage.createSliceDialog.submitButton).toBeDisabled();
});

test("I can see the empty state when there are no slices", async ({
  slicesListPage,
  procedures,
}) => {
  const libraries = generateLibraries({ slicesCount: 0 });
  procedures.mock("getState", ({ data }) => ({
    ...(data as Record<string, string>),
    libraries,
  }));

  await slicesListPage.goto();
  await expect(slicesListPage.blankSlate).toBeVisible();
});

test("I can create a slice from the empty state", async ({
  slicesListPage,
  sliceBuilderPage,
  procedures,
}) => {
  procedures.mock("getState", ({ data }) => ({
    ...(data as Record<string, string>),
    libraries: [
      {
        ...(data as { libraries: Record<string, unknown>[] }).libraries[0],
        components: [],
      },
    ],
  }));

  await slicesListPage.goto();
  await expect(slicesListPage.blankSlate).toBeVisible();
  await slicesListPage.blankSlateCreateAction.click();
  await slicesListPage.addSliceDropdownCreateNewAction.click();

  const sliceName = "Slice" + generateRandomId();
  procedures.unmock("getState");
  await slicesListPage.createSliceDialog.createSlice(sliceName);

  await sliceBuilderPage.checkBreadcrumb(sliceName);
});

test("I can update the screenshot", async ({ slicesListPage, slice }) => {
  await slicesListPage.goto();
  await slicesListPage.openUpdateScreenshotDialog(slice.name);

  await expect(
    slicesListPage.updateScreenshotDialog.screenshotPlaceholder,
  ).toBeVisible();
  await slicesListPage.updateScreenshotDialog.updateScreenshot(
    "slice-screenshot-imageLeft",
  );
  await expect(
    slicesListPage.updateScreenshotDialog.screenshotPlaceholder,
  ).not.toBeVisible();
});

test("I will send a tracking event when I create a slice", async ({
  slicesListPage,
  sliceBuilderPage,
  procedures,
}) => {
  let trackCallCount = 0;
  procedures.mock("telemetry.track", ({ args }) => {
    const [arg] = args as [{ event: string }];
    if (arg.event === "slice:created") trackCallCount++;
  });

  await slicesListPage.goto();
  await slicesListPage.addSliceDropdown.click();
  await slicesListPage.addSliceDropdownCreateNewAction.click();

  const sliceName = "Slice" + generateRandomId();
  await slicesListPage.createSliceDialog.createSlice(sliceName);

  await sliceBuilderPage.checkBreadcrumb(sliceName);
  expect(trackCallCount).toBe(1);

  trackCallCount = 0;

  procedures.mock("slices.createSlice", () => {
    throw new Error("forced failure");
  });

  await slicesListPage.goto();
  await slicesListPage.addSliceDropdown.click();
  await slicesListPage.addSliceDropdownCreateNewAction.click();

  const failedSliceName = "Slice" + generateRandomId();
  await slicesListPage.createSliceDialog.nameInput.fill(failedSliceName);
  await slicesListPage.createSliceDialog.submitButton.click();
  await slicesListPage.createSliceDialog.checkSliceCreationErrorMessage();

  expect(trackCallCount).toBe(0);
});
