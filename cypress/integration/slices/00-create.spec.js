describe("Create Slices", () => {
  const name = "TestSlice";
  const lib = "slices--ecommerce"; // name of the first lib of the next project.
  beforeEach(() => {
    cy.clearLocalStorageSnapshot();
    cy.cleanSliceMachineUserContext();
    cy.task("rmrf", `${lib}/${name}`);
  });

  it("A user can create a slice", () => {
    cy.setupSliceMachineUserContext();
    cy.visit(`/slices`);
    cy.waitUntil(() => cy.get("[data-cy=create-slice]"));
    cy.get("[data-cy=create-slice]").click();
    cy.get("[data-cy=create-slice-modal]").should("be.visible");

    cy.get("input[data-cy=slice-name-input]").type(name);
    cy.get("[data-cy=create-slice-modal]").submit();
    cy.location("pathname", { timeout: 5000 }).should(
      "eq",
      `/${lib}/${name}/default`
    );
    cy.visit(`/${lib}/${name}/default`);
    cy.location("pathname", { timeout: 5000 }).should(
      "eq",
      `/${lib}/${name}/default`
    );
  });
});
