const sliceName = "DuplicateSlices";
const sliceId = "duplicate_slices";
const lib = "slices";

describe("Duplicate Slices", () => {
  beforeEach(() => {
    cy.setSliceMachineUserContext({});
    cy.clearProject();
  });

  it("A user can not create two slices with the same name", () => {
    cy.createSlice(lib, sliceId, sliceName);

    // do it again
    cy.visit(`/slices`);
    cy.waitUntil(() => cy.get("[data-cy=create-slice]"));
    cy.get("[data-cy=create-slice]").click();
    cy.get("[data-cy=create-slice-modal]").should("be.visible");

    cy.get("input[data-cy=slice-name-input]").type(sliceName);
    cy.get("form").click();
    cy.get("[type=submit]").should("be.disabled");
    cy.get("[data-cy=slice-name-input-error]").contains(
      "Slice name is already taken."
    );
  });
});
