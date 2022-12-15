const sliceName = "TestSlice";
const sliceId = "test_slice"; // generated automatically from the slice name
const lib = "slices";

describe("Create Slices", () => {
  beforeEach(() => {
    cy.setSliceMachineUserContext({});
    cy.clearProject();
  });

  it("A user can create and rename a slice", () => {
    cy.createSlice(lib, sliceId, sliceName);

    // remove widget
    cy.get('[data-cy="slice-menu-button"]').first().click();
    cy.contains("Delete field").click();
    cy.get('[data-cy="builder-save-button"]').should("not.be.disabled");

    cy.renameSlice(lib, sliceName, "EditedSliceName");
  });
});
