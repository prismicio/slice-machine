import { SimulatorPage } from "../../pages/simulator/simulatorPage";
import { EditorPage } from "../../pages/simulator/editorPage";
import { SlicePage } from "../../pages/slices/slicePage";
import { SLICE_MOCK_FILE } from "../../consts";

const SLICE = {
  id: "scenario008",
  name: "Scenario008",
  library: "slices",
};

describe("Scenario 008", () => {
  let slice = new SlicePage();
  let simulator = new SimulatorPage();
  let editor = new EditorPage();

  beforeEach(() => {
    cy.clearProject();
    cy.setSliceMachineUserContext({});
  });

  it("creates slice and tests the editor mocks", () => {
    cy.createSlice(SLICE.library, SLICE.id, SLICE.name);

    slice
      .addVariation("SecondVariation")
      .addNewWidgetField("SimpleTextField", "Key Text")
      .addNewWidgetField("RichTextField", "Rich Text")
      .addNewWidgetField("NumberField", "Number")
      .addNewWidgetField("BooleanField", "Boolean")
      .addNewWidgetField("SelectField", "Select")
      .addNewWidgetField("ImageField", "Image")
      .save();

    // force mock value for the boolean and select fields
    cy.modifyFile(SLICE_MOCK_FILE(SLICE.name), (mock) =>
      mock.map((variation) =>
        variation.variation === "default"
          ? variation
          : {
              ...variation,
              primary: {
                ...variation.primary,
                booleanfield: {
                  ...variation.primary.booleanfield,
                  value: false,
                },
                selectfield: {
                  ...variation.primary.selectfield,
                  value: "1",
                },
              },
            }
      )
    );

    simulator.setup();
    slice.openSimulator();

    // Wait for the editor to be fully loaded
    cy.contains("label > span", "Title").should("be.visible");

    simulator.changeVariations("Default");
    cy.contains("Scenario008 • Default").should("be.visible");

    simulator.changeVariations("SecondVariation");

    // editor # toggle
    cy.contains("Scenario008 • SecondVariation").should("be.visible");
    simulator.toggleEditor();
    cy.contains("Scenario008 • SecondVariation").should("not.be.visible");
    simulator.toggleEditor();
    cy.contains("Scenario008 • SecondVariation").should("be.visible");

    // editor # change field values
    editor.type("SimpleTextField", "SimpleTextContent");
    editor.type("RichTextField", "RichTextContent");
    editor.type("NumberField", "42", "have.value");
    editor.toggleBooleanField("BooleanField");
    editor.select("SelectField", "2");

    editor.changeImage("ImageField").then((newImageSrc) => {
      editor.type("Alt text", "An ananas maybe", "have.value");

      simulator.saveMocksButton.click();

      cy.contains('[role="alert"]', "Saved").should("be.visible");

      cy.reload();

      cy.getInputByLabel("SimpleTextField").should(
        "contain",
        "SimpleTextContent"
      );
      cy.getInputByLabel("RichTextField").should("contain", "RichTextContent");
      cy.getInputByLabel("NumberField").should("have.value", "42");
      cy.getInputByLabel("BooleanField")
        .invoke("attr", "aria-checked")
        .should("equal", "true");
      cy.getInputByLabel("SelectField").should("contain", "2");

      cy.getInputByLabel("Alt text").should("have.value", "An ananas maybe");
      cy.get("[alt='An ananas maybe']")
        .invoke("attr", "src")
        .should("contain", newImageSrc.substr(0, newImageSrc.indexOf("?") + 1));
    });
  });
});
