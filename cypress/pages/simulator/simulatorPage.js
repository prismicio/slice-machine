import { MANIFEST_FILE } from "../../consts";

class SimulatorPage {
  get saveMocksButton() {
    return cy.contains("Save mock content");
  }

  /**
   * Setup the slice simulator in the example project, and stub the window open
   * event to open in the same page.
   */
  setup() {
    cy.readFile(MANIFEST_FILE, "utf-8").then((json) => {
      const data = {
        ...json,
        localSliceSimulatorURL: "http://localhost:3000/slice-simulator",
      };
      return cy.writeFile(MANIFEST_FILE, JSON.stringify(data, null, 2));
    });

    return this;
  }

  /**
   * Change the slice variations using the variations dropdown in the simulator.
   *
   * @param {string} targetVariation The new variation value.
   */
  changeVariations(targetVariation) {
    cy.get("[aria-label='Expand variations']").click({ force: true });
    cy.contains(targetVariation).click();

    return this;
  }

  toggleEditor() {
    cy.contains("label", "Editor").click();

    return this;
  }
}

export const simulatorPage = new SimulatorPage();
