describe("Duplicate custom types", () => {
  const name = "Duplicated Custom Type";
  const id = "duplicated-custom-type";

  beforeEach(() => {
    cy.clearLocalStorageSnapshot();
    cy.cleanSliceMachineUserContext();
    cy.task("rmrf", `customtypes/${id}`);
    cy.setupSliceMachineUserContext();
    cy.visit("/");
    // loading spinner
    cy.waitUntil(() => cy.get("[data-cy=create-ct]")).then(() => true);
    cy.get("[data-cy=create-ct]").click();
    cy.get("[data-cy=create-ct-modal]").should("be.visible");

    cy.get("input[data-cy=ct-name-input]").type(name);
    cy.get("input[data-cy=ct-id-input]").type(id);
    cy.get("[data-cy=create-ct-modal]").submit();
    cy.location("pathname", { timeout: 5000 }).should("eq", `/cts/${id}`);
  });

  it("when using a label that is already in use it should warn the user", () => {
    cy.visit("/");
    cy.waitUntil(() => cy.get("[data-cy=create-ct]")).then(() => true);
    cy.get("[data-cy=create-ct]").click();
    cy.get("[data-cy=create-ct-modal]").should("be.visible");

    cy.get("[data-cy=ct-name-input]").type(name);

    cy.get("form").click();
    cy.get("[type=submit]").should("be.disabled");

    cy.get("[data-cy=ct-name-input-error]").contains(
      "Custom Type name is already taken."
    );
  });

  it("when using a id that is already in use it should warn the user", () => {
    cy.visit("/");
    cy.waitUntil(() => cy.get("[data-cy=create-ct]")).then(() => true);
    cy.get("[data-cy=create-ct]").click();
    cy.get("[data-cy=create-ct-modal]").should("be.visible");

    cy.get("input[data-cy=ct-id-input]").type(id);

    cy.get("form").click();
    cy.get("[type=submit]").should("be.disabled");

    cy.get("[data-cy=ct-id-input-error]").contains(
      `ID "${id}" exists already.`
    );
  });
});
