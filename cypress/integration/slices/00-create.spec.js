import path from "path";

describe("Create Slices", () => {
  const sliceName = "TestSlice";
  const editedSliceName = "TestSlice2";
  const lib = "slices--ecommerce"; // name of the first lib of the next project.
  const pathToLib = path.join("e2e-projects", "next", "slices", "ecommerce");
  const generatedPath = path.join(
    "e2e-projects",
    "next",
    ".slicemachine",
    "assets",
    "slices",
    "ecommerce"
  ); // path to th library
  const pathToLibraryState = path.join(
    "e2e-projects",
    "next",
    ".slicemachine",
    "libraries-state.json"
  );

  const pathToMock = (slice) =>
    path.join(
      "e2e-projects",
      "next",
      ".slicemachine",
      "assets",
      "slices",
      "ecommerce",
      slice,
      "mocks.json"
    );

  beforeEach(() => {
    cy.clearLocalStorageSnapshot();
    cy.cleanSliceMachineUserContext();
    cy.task("rmrf", path.join(pathToLib, sliceName));
    cy.task("rmrf", path.join(pathToLib, editedSliceName));
    cy.task("rmrf", path.join(generatedPath, sliceName));
    cy.task("rmrf", path.join(generatedPath, editedSliceName));
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

    cy.readFile(pathToMock(sliceName), "utf-8")
      .then((mock) => {
        return cy
          .readFile(pathToLibraryState, "utf-8")
          .then((librariesState) => {
            return { mock, librariesState };
          });
      })
      .then(({ mock, librariesState }) => {
        const want = mock[0];
        const got =
          librariesState["slices/ecommerce"].components["test_slice"].mocks
            .default;
        expect(got).to.deep.equal(want);
      });

    // fake push
    cy.intercept("/api/slices/push?sliceName=TestSlice&from=slices/ecommerce", {statusCode: 200, body: {}})
    cy.get('[data-cy="slice-builder-push-or-save-button"]').click()

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

    cy.get('[data-cy="slice-builder-push-or-save-button"]').should("not.be.disabled")

  });
});
