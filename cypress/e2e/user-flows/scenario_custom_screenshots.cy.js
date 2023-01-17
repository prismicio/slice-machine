import { ScreenshotModal } from "../../pages/slices/screenshotModal";
import { SliceCard } from "../../pages/slices/sliceCard";
import { Menu } from "../../pages/menu";
import { SliceBuilder } from "../../pages/slices/sliceBuilder";
import { Menu } from "../../pages/Menu";

describe("I am an existing SM user and I want to upload screenshots on variations of an existing Slice", () => {
  const random = Date.now();

  const slice = {
    id: `test_custom_screenshots${random}`,
    name: `TestCustomScreenshots${random}`,
    library: "slices",
  };

  const sliceBuilder = new SliceBuilder();
  const screenshotModal = new ScreenshotModal();
  const menu = new Menu();
  const sliceCard = new SliceCard(slice.name);

  const wrongScreenshot = "screenshots/preview_small.png";
  const defaultScreenshot = "screenshots/preview_medium.png";
  const variationScreenshot = "screenshots/preview_large.png";

  before("Cleanup local data and create a new slice", () => {
    cy.clearProject();
    cy.setSliceMachineUserContext({});
    // Push all local changes in case there are deleted slices
    cy.pushLocalChanges();
    cy.createSlice(slice.library, slice.id, slice.name);
  });

  beforeEach("Start from the Slice page", () => {
    cy.setSliceMachineUserContext({});
    sliceBuilder.goTo(slice.library, slice.name);
  });

  it("Upload and replace custom screenshots", () => {
    // Upload custom screenshot on default variation
    sliceBuilder.imagePreview.should("not.exist");
    sliceBuilder.openScreenshotModal();

    screenshotModal
      .verifyImageIsEmpty()
      .uploadImage(wrongScreenshot)
      .verifyImageIs(wrongScreenshot)
      .dragAndDropImage(defaultScreenshot)
      .verifyImageIs(defaultScreenshot)
      .close();
    sliceBuilder.imagePreview.isSameImageAs(defaultScreenshot);

    // Upload screenshot on variation from the Changes Page
    const missingScreenshotVariation = "Missing screenshot";
    slicePage.addVariation(missingScreenshotVariation);

    sliceBuilder.imagePreview.should("not.exist");
    sliceBuilder.save();

    menu.navigateTo("Slices");
    sliceCard.imagePreview.isSameImageAs(defaultScreenshot);

    menu.navigateTo("Changes");
    changes.screenshotsButton.should("be.visible");
    sliceCard.content.should("include.text", "1/2 screenshots missing");
    sliceCard.imagePreview.isSameImageAs(defaultScreenshot);

    sliceCard.openScreenshotModal();
    screenshotModal
      .verifyImageIs(defaultScreenshot)
      .selectVariation(missingScreenshotVariation)
      .verifyImageIsEmpty()
      .dragAndDropImage(variationScreenshot)
      .verifyImageIs(variationScreenshot)
      .close();
    sliceCard.content.should("not.include.text", "screenshots missing");
    sliceCard.imagePreview.isSameImageAs(defaultScreenshot);

    cy.pushLocalChanges(1);
  });

  it("Error displayed when non-image files are uploaded", () => {
    slicePage.goTo(slice.library, slice.name);
    slicePage.addVariation("Error handling");
    cy.saveSliceModifications();

    slicePage.openScreenshotModal();
    cy.addVariationToSlice("Error handling");
    sliceBuilder.openScreenshotModal();
    cy.contains("Select file").selectFile(
      {
        contents: Cypress.Buffer.from("this is not an image"),
        fileName: "file.txt",
        mimeType: "text/plain",
      },
      { action: "drag-drop" }
    );
    cy.contains("Only files of type png, jpg, jpeg are accepted.").should(
      "be.visible"
    );

    screenshotModal.verifyImageIsEmpty().close();
  });
});
