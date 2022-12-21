const customTypeName = "Duplicated Custom Type";
const customTypeId = "duplicated_custom_type";

describe("Duplicate custom types", () => {
  beforeEach(() => {
    cy.setSliceMachineUserContext({});
    cy.clearProject();
  });

  it("when using a label that is already in use it should warn the user", () => {
    cy.createCustomType(customTypeId, customTypeName);

    cy.visit("/");
    cy.get("[data-cy=create-ct]").click();
    cy.get("[data-cy=create-ct-modal]").should("be.visible");

    cy.get("[data-cy=ct-name-input]").type(customTypeName);

    cy.get("form").click();
    cy.get("[type=submit]").should("be.disabled");

    cy.get("[data-cy=ct-name-input-error]").contains(
      "Custom Type name is already taken."
    );
  });

  it("when using a id that is already in use it should warn the user", () => {
    cy.createCustomType(customTypeId, customTypeName);

    cy.visit("/");
    cy.get("[data-cy=create-ct]").click();
    cy.get("[data-cy=create-ct-modal]").should("be.visible");

    cy.get("input[data-cy=ct-id-input]").type(customTypeId);

    cy.get("form").click();
    cy.get("[type=submit]").should("be.disabled");

    cy.get("[data-cy=ct-id-input-error]").contains(
      `ID "${customTypeId}" exists already.`
    );
  });
});
