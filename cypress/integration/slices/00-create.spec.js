describe("Create Slices", () => {
  const sliceName = "TestSlice";
  const editedSliceName = "TestSlice2";
  const lib = "slices--ecommerce"; // name of the first lib of the next project.
  const path = "e2e-projects/next/slices/ecommerce";
  const generatedPath =
    "e2e-projects/next/.slicemachine/assets/slices/ecommerce"; // path to th library

  beforeEach(() => {
    cy.clearLocalStorageSnapshot();
    cy.cleanSliceMachineUserContext();
    cy.task("rmrf", `${path}/${sliceName}`);
    cy.task("rmrf", `${path}/${editedSliceName}`);
    cy.task("rmrf", `${generatedPath}/${sliceName}`);
    cy.task("rmrf", `${generatedPath}/${editedSliceName}`);
  });

  it("A user can create and rename a slice", () => {
    cy.setupSliceMachineUserContext();
    cy.visit(`/slices`);
    cy.waitUntil(() => cy.get("[data-cy=create-slice]"));

    // create slice
    cy.get("[data-cy=create-slice]").click();
    cy.get("[data-cy=create-slice-modal]").should("be.visible");

    cy.get("input[data-cy=slice-name-input]").type(sliceName);
    cy.get("[data-cy=create-slice-modal]").submit();
    cy.location("pathname", { timeout: 20000 }).should(
      "eq",
      `/${lib}/${sliceName}/default`
    );
    cy.visit(`/${lib}/${sliceName}/default`);
    cy.location("pathname", { timeout: 20000 }).should(
      "eq",
      `/${lib}/${sliceName}/default`
    );
    cy.readFile(`${path}/${sliceName}/types.ts`).should('contains', sliceName);

    // edit slice name
    cy.get('[data-cy="edit-slice-name"]').click();
    cy.get("[data-cy=rename-slice-modal]").should("be.visible");
    cy.get('[data-cy="slice-name-input"]').should("have.value", sliceName);
    cy.get('[data-cy="slice-name-input"]').clear().type(`${editedSliceName}`);
    cy.get("[data-cy=rename-slice-modal]").submit();
    cy.location("pathname", { timeout: 20000 }).should(
      "eq",
      `/${lib}/${editedSliceName}/default`
    );
    cy.get("[data-cy=rename-slice-modal]").should("not.exist");
    cy.get('[data-cy="slice-and-variation-name-header"]').contains(
      `/ ${editedSliceName} / Default`
    );
    cy.readFile(`${path}/${editedSliceName}/types.ts`).should('contains', editedSliceName);
  });
});
