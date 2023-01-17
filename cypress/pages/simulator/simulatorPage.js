import path from "path";
import { MANIFEST_FILE, ROOT } from "../../consts";

export class SimulatorPage {
  get saveMocksButton() {
    return cy.contains("Save mock content");
  }

  get takeScreenshotButton() {
    return cy.contains("Take a screenshot");
  }

  get screenshotToast() {
    return cy.contains("Tap to view screenshot");
  }

  get simulatorIframe() {
    return cy.get("#__iframe-renderer");
  }

  get widthInput() {
    return cy.get('input[name="W-screensize-input"]');
  }

  get heightInput() {
    return cy.get('input[name="H-screensize-input"]');
  }

  getScreenSizeDropdown(currentValue) {
    return cy.get("button").contains(currentValue);
  }

  /**
   * Setup the slice simulator in the example project, and stub the window open event to open in the same page.
   */
  setup() {
    cy.fixture("slice-simulator.jsx", "utf-8").then((file) => {
      const pathToFile = path.join(ROOT, "pages", "slice-simulator.jsx");
      return cy.writeFile(pathToFile, file);
    });

    cy.readFile(MANIFEST_FILE, "utf-8").then((json) => {
      const data = {
        ...json,
        localSliceSimulatorURL: "http://localhost:3000/slice-simulator",
      };
      return cy.writeFile(MANIFEST_FILE, JSON.stringify(data, null, 2));
    });

    cy.window().then((win) => {
      cy.stub(win, "open").callsFake((url) => {
        return win.open.wrappedMethod.call(win, url, "_self");
      });
    });

    return this;
  }

  /**
   * Use the screen size dropdown menu to change the simulator screen size.
   *
   * @param {string} startValue The expected start value of the dropdown button.
   * @param {string} newValue The new value to set the screen size to.
   */
  resizeScreenWithDropdown(startValue, newValue) {
    this.getScreenSizeDropdown(startValue).click();
    cy.contains(newValue).click();

    return this;
  }

  /**
   * Use the screen size input fields to change the simulator screen size.
   *
   * @param {number} newWidth The new value to the the width to.
   * @param {number} newHeight The new value to the the height to.
   */
  resizeScreenWithInput(newWidth, newHeight) {
    this.widthInput.clear().type(`{rightArrow}${newWidth}`);
    this.heightInput.clear().type(`{rightArrow}${newHeight}`);

    return this;
  }

  /**
   * Check that the dimensions of the simulator are equal to the provided ones.
   *
   * @param {number} expectedWidth The value which the width should equal.
   * @param {number} expectedHeight The value which the height should equal.
   */
  validateSimulatorSize(expectedWidth, expectedHeight) {
    this.simulatorIframe
      .should("have.css", "maxWidth")
      .and("eq", `${expectedWidth}px`);
    this.simulatorIframe
      .should("have.css", "minWidth")
      .and("eq", `${expectedWidth}px`);
    this.simulatorIframe
      .should("have.css", "maxHeight")
      .and("eq", `${expectedHeight}px`);
    this.simulatorIframe
      .should("have.css", "minHeight")
      .and("eq", `${expectedHeight}px`);

    return this;
  }

  takeAScreenshotAndOpenModal() {
    this.takeScreenshotButton.click();

    cy.contains("Screenshot taken", { timeout: 30000 }).should("be.visible");

    this.screenshotToast.click();

    return this;
  }

  /**
   * Change the slice variations using the variations dropdown in the simulator.
   *
   * @param {string} targetVariation the new variation value.
   */
  changeVariations(targetVariation) {
    cy.get("button").contains("Default").click();
    cy.contains(targetVariation).click();

    return this;
  }
}
