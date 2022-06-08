describe("Create Slices", () => {
  const name = "TestSlice";
  const lib = "slices--ecommerce"; // name of the first lib of the next project.
  const path = 'e2e-projects/next/slices/ecommerce'; // path to th library 
  beforeEach(() => {
    cy.clearLocalStorageSnapshot();
    cy.cleanSliceMachineUserContext();
    cy.task("rmrf", `${path}/${name}`);
  });

  it("A user can create a slice", () => {
    cy.setupSliceMachineUserContext();
    cy.visit(`/slices`);
    cy.waitUntil(() => cy.get("[data-cy=create-slice]"));
    cy.get("[data-cy=create-slice]").click();
    cy.get("[data-cy=create-slice-modal]").should("be.visible");

    cy.get("input[data-cy=slice-name-input]").type(name);
    cy.get("[data-cy=create-slice-modal]").submit();
    cy.location("pathname", { timeout: 10000 }).should(
      "eq",
      `/${lib}/${name}/default`
    );
    cy.visit(`/${lib}/${name}/default`);
    cy.location("pathname", { timeout: 10000 }).should(
      "eq",
      `/${lib}/${name}/default`
    );
  });
});
