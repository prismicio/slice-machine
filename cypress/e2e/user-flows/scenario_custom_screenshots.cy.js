import { screenshotModal } from "../../pages/slices/screenshotModal";
import { SliceCard } from "../../pages/slices/sliceCard";
import { menu } from "../../pages/menu";
import { sliceBuilder } from "../../pages/slices/sliceBuilder";
import { changesPage } from "../../pages/changes/changesPage";

describe.skip("I am an existing SM user and I want to upload screenshots on variations of an existing Slice", () => {
  let slice;
  const initSliceData = (random = Date.now()) => ({
    id: `test_custom_screenshots${random}`,
    name: `TestCustomScreenshots${random}`,
    library: ".--slices",
  });

  const wrongScreenshot = "screenshots/preview_small.png";
  const defaultScreenshot = "screenshots/preview_medium.png";
  const variationScreenshot = "screenshots/preview_large.png";

  beforeEach("Cleanup local data and start from the Slice page", () => {
    cy.clearProject();
    cy.setSliceMachineUserContext({});

    // create slice with unique (id,name) to avoid slice creation conflicts when tests are retried
    slice = initSliceData();
    cy.createSlice(slice.library, slice.id, slice.name);
    sliceBuilder.goTo(slice.library, slice.name);
  });

  it.skip("Upload and replace custom screenshots", () => {
    // Upload custom screenshot on default variation
    let sliceCard = new SliceCard(slice.name);
    sliceCard.imagePreview.should("not.exist");
    sliceCard.openScreenshotModal();

    screenshotModal
      .verifyImageIsEmpty()
      .uploadImage(wrongScreenshot)
      .verifyImageIs(wrongScreenshot)
      .dragAndDropImage(defaultScreenshot)
      .verifyImageIs(defaultScreenshot)
      .close();
    sliceCard.imagePreview.isSameImageAs(defaultScreenshot);

    // Upload screenshot on variation from the Changes Page
    const missingScreenshotVariation = "Missing screenshot";
    sliceBuilder.addVariation(missingScreenshotVariation);

    sliceCard = new SliceCard(slice.name, missingScreenshotVariation);
    sliceCard.imagePreview.should("not.exist");
    sliceBuilder.save();

    menu.navigateTo("Slices");
    sliceCard = new SliceCard(slice.name);
    sliceCard.imagePreview.isSameImageAs(defaultScreenshot);

    menu.navigateTo("Changes");
    changesPage.screenshotsButton.should("be.visible");
    sliceCard.content.should("include.text", "Missing screenshot");
    sliceCard.imagePreview.isSameImageAs(defaultScreenshot);

    sliceCard.openScreenshotModal();
    screenshotModal
      .verifyImageIs(defaultScreenshot)
      .selectVariation(missingScreenshotVariation)
      .verifyImageIsEmpty()
      .dragAndDropImage(variationScreenshot)
      .verifyImageIs(variationScreenshot)
      .close();
    sliceCard.content.should("not.include.text", "Missing screenshot");
    sliceCard.imagePreview.isSameImageAs(defaultScreenshot);

    changesPage.pushChanges().isUpToDate();
  });

  it("Error displayed when non-image files are uploaded", () => {
    const variationName = "Error handling";

    sliceBuilder.goTo(slice.library, slice.name);
    sliceBuilder.addVariation(variationName);
    sliceBuilder.save();

    new SliceCard(slice.name, variationName).openScreenshotModal();
    cy.contains("Select file").selectFile(
      {
        contents: Cypress.Buffer.from("this is not an image"),
        fileName: "file.txt",
        mimeType: "text/plain",
      },
      { action: "drag-drop" },
    );
    cy.contains("Only files of type png, jpg, jpeg are accepted.").should(
      "be.visible",
    );

    screenshotModal.verifyImageIsEmpty().close();
  });
});
