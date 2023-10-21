import { simulatorPage } from "../../pages/simulator/simulatorPage";
import { editorPage } from "../../pages/simulator/editorPage";
import { sliceBuilder } from "../../pages/slices/sliceBuilder";

const SLICE = {
  id: "scenario008",
  name: "Scenario008",
  library: ".--slices",
};

describe.skip("Scenario 008", () => {
  beforeEach(() => {
    cy.clearProject();
    cy.setSliceMachineUserContext({});
  });

  it("edits the different mock fields available in the editor", () => {
    cy.createSlice(SLICE.library, SLICE.id, SLICE.name);

    sliceBuilder
      .addVariation("SecondVariation")
      .addNewWidgetField("SimpleTextField", "Key Text")
      .addNewWidgetField("RichTextField", "Rich Text")
      .addNewWidgetField("NumberField", "Number")
      .addNewWidgetField("BooleanField", "Boolean")
      .addNewWidgetField("SelectField", "Select")
      .addNewWidgetField("ImageField", "Image")
      .save();

    simulatorPage.setup();
    sliceBuilder.openSimulator();

    // Wait for the editor to be fully loaded
    editorPage.contains("Scenario008 • SecondVariation").should("be.visible");

    simulatorPage.changeVariations("Default");
    cy.contains("Scenario008 • Default").should("be.visible");

    simulatorPage.changeVariations("SecondVariation");

    // editor # toggle
    cy.contains("Scenario008 • SecondVariation").should("be.visible");
    simulatorPage.toggleEditor();
    cy.contains("Scenario008 • SecondVariation").should("not.be.visible");
    simulatorPage.toggleEditor();
    cy.contains("Scenario008 • SecondVariation").should("be.visible");

    // Need to know the initial of Boolean and Select fields to know if the update worked
    cy.getInputByLabel("SelectField")
      .invoke("text")
      .then((currentValue) => {
        cy.wrap(currentValue == "1" ? "2" : "1").as("newSelectValue");
      });
    cy.getInputByLabel("BooleanField")
      .invoke("attr", "aria-checked")
      .then((currentValue) => {
        cy.wrap(currentValue == "true" ? "false" : "true").as(
          "newBooleanValue",
        );
      });

    // editor # change field values
    editorPage.type("SimpleTextField", "SimpleTextContent");
    editorPage.type("RichTextField", "RichTextContent");
    editorPage.type("NumberField", "42", "have.value");
    editorPage.toggleBooleanField("BooleanField");
    cy.get("@newSelectValue").then((value) => {
      editorPage.select("SelectField", value);
    });

    editorPage
      .changeImage("ImageField")
      .invoke("attr", "src")
      .as("newImageSrc");
    editorPage.type("Alt text", "An ananas maybe", "have.value");

    simulatorPage.saveMocksButton.click();

    cy.contains('[role="alert"]', "Saved").should("be.visible");

    cy.reload();

    cy.getInputByLabel("SimpleTextField").should(
      "contain",
      "SimpleTextContent",
    );
    cy.getInputByLabel("RichTextField").should("contain", "RichTextContent");
    cy.getInputByLabel("NumberField").should("have.value", "42");
    cy.get("@newBooleanValue").then((value) => {
      cy.getInputByLabel("BooleanField")
        .invoke("attr", "aria-checked")
        .should("equal", value);
    });
    cy.get("@newSelectValue").then((value) => {
      cy.getInputByLabel("SelectField").should("contain", value);
    });

    cy.getInputByLabel("Alt text").should("have.value", "An ananas maybe");
    cy.get("@newImageSrc").then((newImageSrc) => {
      cy.get("[alt='An ananas maybe']")
        .invoke("attr", "src")
        .should("contain", newImageSrc.substr(0, newImageSrc.indexOf("?") + 1));
    });
  });
});
