import { simulatorPage } from "../../pages/simulator/simulatorPage";
import { screenshotModal } from "../../pages/simulator/screenshotModal";
import { sliceBuilder } from "../../pages/slices/sliceBuilder";

describe("I am an existing SM user and I want to take a screenshot from the slice simulator", () => {
  const random = Date.now();

  const slice = {
    id: `test_screenshots${random}`,
    name: `TestScreenshots${random}`,
    library: "slices",
    newVariationName: "foo",
  };

  before("Cleanup local data and create a new slice", () => {
    cy.clearProject();
    cy.setSliceMachineUserContext({});
    cy.createSlice(slice.library, slice.id, slice.name);

    sliceBuilder.addVariation(slice.newVariationName);
    sliceBuilder.save();
  });

  beforeEach("Start from the Slice page", () => {
    cy.setSliceMachineUserContext({});

    sliceBuilder.goTo(slice.library, slice.name);
  });

  it("Open the simulator on the default variant", () => {
    simulatorPage.setup();

    sliceBuilder.openSimulator();

    simulatorPage
      .resizeScreenWithDropdown("Desktop", "Tablet")
      .validateSimulatorSize(1080, 810)
      .resizeScreenWithDropdown("Tablet", "Desktop")
      .validateSimulatorSize(1280, 800)
      .takeAScreenshotAndOpenModal();
    screenshotModal.imagePreview.isCorrectDimensions(1280, 800);
    screenshotModal.close();
    simulatorPage
      .resizeScreenWithInput(500, 500)
      .validateSimulatorSize(500, 500)
      .takeAScreenshotAndOpenModal();
    screenshotModal.imagePreview.isCorrectDimensions(500, 500);
    const mainVariationScreenshotSrc = screenshotModal.imageSrc;
    screenshotModal.close();

    // Take a screenshot of the second variation
    simulatorPage
      .changeVariations(slice.newVariationName)
      .resizeScreenWithDropdown("Custom", "Desktop")
      .validateSimulatorSize(1280, 800)
      .takeAScreenshotAndOpenModal();
    screenshotModal.imagePreview.isCorrectDimensions(1280, 800);
    const secondVariationScreenshotSrc = screenshotModal.imageSrc;
    screenshotModal.close();

    // Check screenshots in the slice page preview
    sliceBuilder.goTo(slice.library, slice.name);
    sliceBuilder.imagePreview.isCorrectDimensions(500, 500);
    expect(sliceBuilder.imagePreviewSrc).to.equal(mainVariationScreenshotSrc);
    sliceBuilder
      .changeToVariation("Default", slice.newVariationName)
      .imagePreview.isCorrectDimensions(1280, 800);
    expect(sliceBuilder.imagePreviewSrc).to.equal(secondVariationScreenshotSrc);
  });
});
