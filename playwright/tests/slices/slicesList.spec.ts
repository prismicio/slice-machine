import { expect } from "@playwright/test";

import { test } from "../../fixtures";
import { generateRandomId } from "../../utils/generateRandomId";

test.run()(
  "I can create a slice",
  async ({ sliceBuilderPage, slicesListPage }) => {
    await slicesListPage.goto();
    await slicesListPage.openCreateDialog();

    const sliceName = "Slice" + generateRandomId();
    await slicesListPage.createSliceDialog.createSlice(sliceName);

    await expect(sliceBuilderPage.getBreadcrumbLabel(sliceName)).toBeVisible();

    await expect(sliceBuilderPage.staticZoneListItem).toHaveCount(0);
    await expect(sliceBuilderPage.repeatableZoneListItem).toHaveCount(0);
  },
);

// See: See: https://github.com/prismicio/slice-machine/issues/599
test.run()(
  "I can only create a slice by using Pascal case for the slice name",
  async ({ slicesListPage }) => {
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
  },
);

test.run()(
  "I cannot create a slice with a name that already exists",
  async ({ slicesListPage, slice }) => {
    await slicesListPage.goto();
    await slicesListPage.openCreateDialog();

    const { nameInput, submitButton } = slicesListPage.createSliceDialog;

    await nameInput.fill(slice.name);
    await expect(submitButton).toBeDisabled();
    await submitButton.click({ force: true });
    await expect(
      slicesListPage.createSliceDialog.sliceAlreadyExistMessage,
    ).toBeVisible();
  },
);

test.run()(
  "I can rename a slice",
  async ({ slice, sliceBuilderPage, slicesListPage }) => {
    await slicesListPage.goto();
    await slicesListPage.openActionMenu(slice.name, "Rename");

    const newSliceName = `${slice.name}Renamed`;
    await slicesListPage.renameSliceDialog.renameSlice(newSliceName);

    // TODO(DT-1802): Production BUG - Sometimes after a rename, old slice name is still visible in the list
    await slicesListPage.page.reload();

    await expect(slicesListPage.getCard(slice.name)).not.toBeVisible();
    await expect(slicesListPage.getCard(newSliceName)).toBeVisible();
    await slicesListPage.clickCard(newSliceName);

    await expect(
      sliceBuilderPage.getBreadcrumbLabel(newSliceName),
    ).toBeVisible();
  },
);

// See: https://github.com/prismicio/slice-machine/issues/791
test.run()(
  "I can only rename a slice by using Pascal case for the slice name",
  async ({ slicesListPage, slice }) => {
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
  },
);

test.run()("I can delete a slice", async ({ slice, slicesListPage }) => {
  await slicesListPage.goto();
  await slicesListPage.openActionMenu(slice.name, "Delete");

  await slicesListPage.deleteSliceDialog.deleteSlice(slice.name);

  // TODO(DT-1802): Production BUG - Sometimes after a delete, slice is still visible in the list
  await slicesListPage.page.reload();

  await expect(slicesListPage.getCard(slice.name)).not.toBeVisible();
  await slicesListPage.page.reload();
  await expect(slicesListPage.getCard(slice.name)).not.toBeVisible();
});
