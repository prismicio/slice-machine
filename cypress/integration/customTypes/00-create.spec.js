describe("Custom Types specs", () => {
  let name = "My Test";
  let id = "my-test";

  beforeEach(() => {
    const ID = Math.floor(10000 + Math.random() * 90000);
    name = `My Test ${ID}`;
    id = `my-test-${ID}`;

    cy.clearLocalStorageSnapshot();
    cy.cleanSliceMachineUserContext();
    cy.task("rmrf", `customtypes/${id}`);
  });

  it("A user can create and rename a custom type", () => {
    cy.setupSliceMachineUserContext();
    cy.visit("/");

    // loading spinner
    cy.waitUntil(() => cy.get("[data-cy=create-ct]")).then(() => true);

    //create custom type
    cy.get("[data-cy=create-ct]").click();
    cy.get("[data-cy=create-ct-modal]").should("be.visible");

    cy.get("input[data-cy=ct-name-input]").type(name);
    cy.get("[data-cy=create-ct-modal]").submit();
    cy.location("pathname", { timeout: 10000 }).should("eq", `/cts/${id}`);

    //edit custom type name
    cy.get('[data-cy="edit-custom-type"]').click();
    cy.get("[data-cy=rename-custom-type-modal]").should("be.visible");
    cy.get('[data-cy="custom-type-name-input"]').should("have.value", name);
    cy.get('[data-cy="custom-type-name-input"]')
      .clear()
      .type(`${name} - Edited`);
    cy.get("[data-cy=rename-custom-type-modal]").submit();
    cy.get("[data-cy=rename-custom-type-modal]").should("not.exist");
    cy.get('[data-cy="custom-type-secondary-breadcrumb"]').contains(
      `/ ${name} - Edited`
    );
  });
});
