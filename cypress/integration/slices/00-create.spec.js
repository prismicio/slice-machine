import path from "path";

describe("Create Slices", () => {
  const root = "e2e-projects/cypress-next-app";
  const type = `${root}/.slicemachine/prismicio.d.ts`;
  const sliceName = "TestSlice";
  const editedSliceName = "TestSlice2";
  const lib = "slices";
  const pathToMock = path.join(
    "e2e-projects",
    "cypress-next-app",
    ".slicemachine",
    "assets",
    "slices",
    sliceName,
    "mocks.json"
  );
  const pathToLibraryState = path.join(
    "e2e-projects",
    "cypress-next-app",
    ".slicemachine",
    "libraries-state.json"
  );

  beforeEach(() => {
    cy.clearLocalStorageSnapshot();
    cy.cleanSliceMachineUserContext();
    cy.task("rmrf", type);
    cy.task("clearDir", `${root}/slices`);
    cy.task("clearDir", `${root}/.slicemachine`);
  });

  it("A user can create and rename a slice", () => {
    cy.setupSliceMachineUserContext({
      hasSendAReview: true,
      isOnboarded: true,
      updatesViewed: {},
      hasSeenTutorialsTooTip: true,
    });
    cy.visit(`/slices`);
    cy.waitUntil(() => cy.get("[data-cy=empty-state-main-button]"));

    // create slice
    cy.get("[data-cy=empty-state-main-button]").click();
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
    cy.readFile(type).should("contains", sliceName);

    // remove widget
    cy.get("#menu-button--menu").last().click();
    cy.contains("Delete field").click();
    cy.get('[data-cy="builder-save-button"]').should("not.be.disabled");

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
  });
});
