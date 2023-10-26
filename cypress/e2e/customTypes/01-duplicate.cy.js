const customTypeName = "Duplicated Custom Type";
const customTypeId = "duplicated_custom_type";

describe.skip("Duplicate custom types", () => {
  beforeEach(() => {
    cy.setSliceMachineUserContext({});
    cy.clearProject();
    cy.createCustomType(customTypeId, customTypeName);
  });

  it("when using a label that is already in use it should warn the user", () => {
    cy.visit("/");
    cy.get("[data-cy=create-ct]").click();
    cy.get("[data-cy=create-ct-modal]").should("be.visible");

    cy.get("[data-cy=ct-name-input]").type(customTypeName);

    cy.get("form").click();
    cy.get("[type=submit]").should("be.disabled");

    cy.get("[data-cy=ct-name-input-error]").contains(
      "Custom type name is already taken.",
    );
  });

  it("when using a id that is already in use it should warn the user", () => {
    cy.visit("/");
    cy.get("[data-cy=create-ct]").click();
    cy.get("[data-cy=create-ct-modal]").should("be.visible");

    cy.get("input[data-cy=ct-id-input]").type(customTypeId);

    cy.get("form").click();
    cy.get("[type=submit]").should("be.disabled");

    cy.get("[data-cy=ct-id-input-error]").contains(
      `ID "${customTypeId}" exists already.`,
    );
  });
});
