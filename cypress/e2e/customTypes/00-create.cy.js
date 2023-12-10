import { CUSTOM_TYPE_MODEL } from "../../consts";

const customTypeName = "My Test";
const customTypeId = "my_test";

describe.skip("Custom Types specs", () => {
  beforeEach(() => {
    cy.setSliceMachineUserContext({});
    cy.clearProject();
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

  it("A user cannot add slices in a new Tab to a new Custom Type", () => {
    cy.createCustomType(customTypeId, customTypeName);

    cy.contains("Add Tab").click();
    cy.getInputByLabel("New Tab ID").type("Foo");
    cy.get("#create-tab").contains("Save").click();

    cy.contains("Add a new slice").should("not.exist");
  });
});
