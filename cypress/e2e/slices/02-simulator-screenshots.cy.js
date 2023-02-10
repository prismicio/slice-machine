import { SlicePage } from "../../pages/slices/slicePage";
import { SimulatorPage } from "../../pages/simulator/simulatorPage";
import { ScreenshotModal } from "../../pages/simulator/screenshotModal";

describe("I am an existing SM user and I want to take a screenshot from the slice simulator", () => {
  const random = Date.now();

  const slice = {
    id: `test_screenshots${random}`,
    name: `TestScreenshots${random}`,
    library: "slices",
    newVariationName: "foo",
  };

  const slicePage = new SlicePage();
  const simulatorPage = new SimulatorPage();
  const screenshotModal = new ScreenshotModal();

  before("Cleanup local data and create a new slice", () => {
    cy.clearProject();
    cy.setSliceMachineUserContext({});
    cy.createSlice(slice.library, slice.id, slice.name);

    slicePage.addVariation(slice.newVariationName);
    cy.saveSliceModifications();
  });

  beforeEach("Start from the Slice page", () => {
    cy.setSliceMachineUserContext({});

    slicePage.goTo(slice.library, slice.name);
  });

  it("Open the simulator on the default variant", () => {
    simulatorPage.setup();

    slicePage.openSimulator();

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
    slicePage.goTo(slice.library, slice.name);
    slicePage.imagePreview.isCorrectDimensions(500, 500);
    expect(slicePage.imagePreviewSrc).to.equal(mainVariationScreenshotSrc);
    slicePage
      .changeToVariation("Default", slice.newVariationName)
      .imagePreview.isCorrectDimensions(1280, 800);
    expect(slicePage.imagePreviewSrc).to.equal(secondVariationScreenshotSrc);
  });
});
