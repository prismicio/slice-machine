import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import { generateRandomId } from "../../utils/generateRandomId";

test.describe("Slices", () => {
  test("I can create a slice", async ({ sliceBuilderPage, slicesListPage }) => {
    await slicesListPage.goto();
    await slicesListPage.openCreateDialog();

    const sliceName = "Slice" + generateRandomId();
    await slicesListPage.createSliceDialog.createSlice(sliceName);

    await expect(
      sliceBuilderPage.breadcrumb.getByText(sliceName),
    ).toBeVisible();

    await expect(sliceBuilderPage.staticZoneListItem).toHaveCount(0);
    await expect(sliceBuilderPage.repeatableZoneListItem).toHaveCount(0);
  });

  test("I can only use Pascal case for the slice name", async ({
    slicesListPage,
  }) => {
    await slicesListPage.goto();
    await slicesListPage.openCreateDialog();

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

  test("I can rename a slice and open the slice after", async ({
    slice,
    sliceBuilderPage,
    slicesListPage,
  }) => {
    await slicesListPage.goto();
    await slicesListPage.openActionDialog(slice.name, "Rename");

    const newSliceName = `${slice.name}Renamed`;
    await slicesListPage.renameSliceDialog.renameSlice(newSliceName);

    // TODO(DT-1802): Production BUG - Sometimes after a rename, old slice name is still visible in the list
    await slicesListPage.page.reload();

    await expect(slicesListPage.getCard(slice.name)).not.toBeVisible();
    await expect(slicesListPage.getCard(newSliceName)).toBeVisible();
    await slicesListPage.clickCard(newSliceName);

    await expect(
      sliceBuilderPage.breadcrumb.getByText(newSliceName),
    ).toBeVisible();
  });

  test("I can delete a slice", async ({ slice, slicesListPage }) => {
    await slicesListPage.goto();
    await slicesListPage.openActionDialog(slice.name, "Delete");

    await expect(
      slicesListPage.deleteSliceDialog.dialog.getByText(`/${slice.name}/`),
    ).toBeVisible();
    await slicesListPage.deleteSliceDialog.deleteSlice();

    // TODO(DT-1802): Production BUG - Sometimes after a delete, slice is still visible in the list
    await slicesListPage.page.reload();

    await expect(slicesListPage.getCard(slice.name)).not.toBeVisible();
    await slicesListPage.page.reload();
    await expect(slicesListPage.getCard(slice.name)).not.toBeVisible();
  });
});
