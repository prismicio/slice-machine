import { CUSTOM_TYPE_MODEL } from "../../consts";

const customTypeName = "My Test";
const customTypeId = "my_test";

describe.skip("Custom Types specs", () => {
  beforeEach(() => {
    cy.setSliceMachineUserContext({});
    cy.clearProject();
  });

  it("A user can create and rename a custom type", () => {
    cy.createCustomType(customTypeId, customTypeName);
    cy.renameCustomType(customTypeId, customTypeName, "New Custom Type Name");
    cy.visit(`/custom-types/${customTypeId}`);
    // add a tab
    cy.contains("Add Tab").click();
    cy.getInputByLabel("New Tab ID").type("Foo");
    cy.get("#create-tab").contains("Save").click();
    cy.wait(500);
    // rename the tab with spaces
    cy.contains("Foo").find("button").click();
    cy.getInputByLabel("Update Tab ID").type("Foo Bar ");
    cy.get("#create-tab").contains("Save").click();

    // save
    cy.contains("Save").click();

    // check that the space has been trimmed
    cy.wait(1000);
    cy.readFile(CUSTOM_TYPE_MODEL(customTypeId), "utf-8")
      .its("json")
      .should("have.a.property", "Foo Bar")
      .should("not.have.a.property", "Foo Bar ");
  });

  it("A user can remove a Text field", () => {
    cy.createCustomType(customTypeId, customTypeName);

    cy.addFieldToCustomType("Key Text", "Key Text Field", "key_text_id");
    cy.deleteWidgetField("Key Text");
  });

  it("A user cannot remove the default UID field", () => {
    cy.createCustomType(customTypeId, customTypeName);

    cy.getWidgetFieldMenu("UID").should("not.exist");
  });

  it("A user cannot add slices to a new Custom Type", () => {
    cy.createCustomType(customTypeId, customTypeName);

    cy.contains("Add a new slice").should("not.exist");
  });

  it("A user cannot add slices in a new Tab to a new Custom Type", () => {
    cy.createCustomType(customTypeId, customTypeName);

    cy.contains("Add Tab").click();
    cy.getInputByLabel("New Tab ID").type("Foo");
    cy.get("#create-tab").contains("Save").click();

    cy.contains("Add a new slice").should("not.exist");
  });

  it("When creating a repeatable page-type it should add meta data tab", () => {
    cy.createCustomType(customTypeId, customTypeName);
    cy.contains("Metadata").click();
    cy.contains("Meta Title");
    cy.contains("Meta Description");
    cy.contains("Meta Image");
  });
});
