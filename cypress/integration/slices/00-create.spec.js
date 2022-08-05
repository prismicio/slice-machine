import path from "path";

describe("Create Slices", () => {
  const sliceName = "TestSlice";
  const editedSliceName = "TestSlice2";
  const lib = "slices";
  const path = "e2e-cypress-next-app/slices";
  const generatedPath = "e2e-cypress-next-app/.slicemachine/assets/slices";

  beforeEach(() => {
    cy.clearLocalStorageSnapshot();
    cy.cleanSliceMachineUserContext();
    cy.exec("rm -r -f e2e-cypress-next-app/slices/*");
    cy.exec("rm -r -f e2e-cypress-next-app/.slicemachine/*");
  });

  it("A user can create and rename a slice", () => {
    cy.setupSliceMachineUserContext();
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
    cy.intercept("/api/slices/push?sliceName=TestSlice&from=slices/ecommerce", {
      statusCode: 200,
      body: {},
    });
    cy.get('[data-cy="slice-builder-push-or-save-button"]').click();

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

    cy.get('[data-cy="slice-builder-push-or-save-button"]').should(
      "not.be.disabled"
    );
  });
});
