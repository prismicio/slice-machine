import { ScreenshotModal } from "../../pages/slices/screenshotModal";
import { SliceCard } from "../../pages/slices/sliceCard";
import { SlicePage } from "../../pages/slices/slicePage";
import { Menu } from "../../pages/Menu";

describe.skip("I am an existing SM user and I want to upload screenshots on variations of an existing Slice", () => {
  const random = Date.now();

  const slice = {
    id: `test_screenshots${random}`,
    name: `TestScreenshots${random}`,
    library: "slices",
  };

  const slicePage = new SlicePage();
  const screenshotModal = new ScreenshotModal();

  const wrongScreenshot = "screenshots/preview_small.png";
  const defaultScreenshot = "screenshots/preview_medium.png";
  const variationScreenshot = "screenshots/preview_large.png";

  before("Cleanup local data and create a new slice", () => {
    cy.clearProject();
    cy.setSliceMachineUserContext({});
    cy.createSlice(slice.library, slice.id, slice.name);
  });

  beforeEach("Start from the Slice page", () => {
    cy.setSliceMachineUserContext({});
    slicePage.goTo(slice.library, slice.name);
  });

  it("Upload and replace a screenshot on the default variation", () => {
    // Upload custom screenshot on default variation
    slicePage.imagePreview.should("not.exist");
    slicePage.openScreenshotModal();

    screenshotModal
      .verifyImageIsEmpty()
      .uploadImage(wrongScreenshot)
      .verifyImageIs(wrongScreenshot)
      .dragAndDropImage(defaultScreenshot)
      .verifyImageIs(defaultScreenshot)
      .close();
    slicePage.imagePreview.isSameImageAs(defaultScreenshot);

    // Upload screenshot on variation from the Changes Page
    const missingScreenshotVariation = "Missing screenshot";
    cy.addVariationToSlice(missingScreenshotVariation);

    slicePage.imagePreview.should("not.exist");
    cy.saveSliceModifications();

    const menu = new Menu();
    const sliceCard = new SliceCard(slice.name);

    menu.navigateTo("Slices");
    sliceCard.imagePreview.isSameImageAs(defaultScreenshot);

    menu.navigateTo("Changes");
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
    cy.addVariationToSlice("Error handling");
    slicePage.openScreenshotModal();
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
