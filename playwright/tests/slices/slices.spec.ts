import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import { generateRandomId } from "../../utils/generateRandomId";

test.describe("Slices", () => {
  test("I can create a slice", async ({ sliceBuilderPage, sliceTablePage }) => {
    await sliceTablePage.goto();
    await sliceTablePage.openCreateModal();

    const sliceName = "Slice" + generateRandomId();
    await sliceTablePage.createSliceModal.createSlice(sliceName);
    await sliceBuilderPage.checkSavedMessage();

    await expect(
      sliceBuilderPage.breadcrumb.getByText(sliceName),
    ).toBeVisible();

    await expect(sliceBuilderPage.staticZoneListItem).toHaveCount(0);
    await expect(sliceBuilderPage.repeatableZoneListItem).toHaveCount(0);
  });

  test("I can only use Pascal case for the slice name", async ({
    sliceTablePage,
  }) => {
    await sliceTablePage.goto();
    await sliceTablePage.openCreateModal();

    const { nameInput, submitButton } = sliceTablePage.createSliceModal;

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

  test("I can rename a slice", async ({
    slice,
    sliceBuilderPage,
    sliceTablePage,
  }) => {
    await sliceTablePage.goto();
    await sliceTablePage.openActionModal(slice.name, "Rename");

    const newSliceName = `${slice.name}Renamed`;
    await sliceTablePage.renameSliceModal.renameSlice(newSliceName);
    await sliceTablePage.renameSliceModal.checkRenamedMessage();

    // TODO(DT-1802): Production BUG - Sometimes after a rename, old slice name is still visible in the list
    await sliceTablePage.page.reload();

    await expect(sliceTablePage.getCard(slice.name)).not.toBeVisible();
    await expect(sliceTablePage.getCard(newSliceName)).toBeVisible();
    await sliceTablePage.clickCard(newSliceName);

    await expect(
      sliceBuilderPage.breadcrumb.getByText(newSliceName),
    ).toBeVisible();
  });

  test("I can delete a slice", async ({ slice, sliceTablePage }) => {
    await sliceTablePage.goto();
    await sliceTablePage.openActionModal(slice.name, "Delete");

    await expect(
      sliceTablePage.deleteSliceModal.modal.getByText(`/${slice.name}/`),
    ).toBeVisible();
    await sliceTablePage.deleteSliceModal.deleteSlice();
    await sliceTablePage.deleteSliceModal.checkDeletedMessage();

    // TODO(DT-1802): Production BUG - Sometimes after a delete, slice is still visible in the list
    await sliceTablePage.page.reload();

    await expect(sliceTablePage.getCard(slice.name)).not.toBeVisible();
    await sliceTablePage.page.reload();
    await expect(sliceTablePage.getCard(slice.name)).not.toBeVisible();
  });
});
