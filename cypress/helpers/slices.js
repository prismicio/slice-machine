import "cypress-wait-until";
import { typesFile, sliceMockFile, libraryStateFile } from '../consts';

export function createSlice(lib, id, name) {
  cy.visit(`/slices`);
  cy.waitUntil(() => cy.get("[data-cy=empty-state-main-button]"));

  // create slice
  cy.get("[data-cy=empty-state-main-button]").click();
  cy.get("[data-cy=create-slice-modal]").should("be.visible");

  cy.get("input[data-cy=slice-name-input]").type(name);
  cy.get("[data-cy=create-slice-modal]").submit();
  cy.location("pathname", { timeout: 20000 }).should(
    "eq",
    `/${lib}/${name}/default`
  );
  cy.readFile(typesFile).should("contains", name);

  cy.readFile(sliceMockFile(name), "utf-8")
  .then((mock) => {
    return cy
      .readFile(libraryStateFile, "utf-8")
      .then((librariesState) => {
        return { mock, librariesState };
      });
  })
  .then(({ mock, librariesState }) => {
    const want = mock[0];
    const got = librariesState["slices"].components[id].mocks.default;
    expect(got).to.deep.equal(want);
  });
};

export function renameSlice(lib, actualName, newName) {
  cy.visit(`/${lib}/${actualName}/default`);
  cy.waitUntil(() => cy.get('[data-cy="edit-slice-name"]'));
  
  // edit slice name
  cy.get('[data-cy="edit-slice-name"]').click();
  cy.get("[data-cy=rename-slice-modal]").should("be.visible");
  cy.get('[data-cy="slice-name-input"]').should("have.value", actualName);
  cy.get('[data-cy="slice-name-input"]').clear().type(`${newName}`);
  cy.get("[data-cy=rename-slice-modal]").submit();
  cy.location("pathname", { timeout: 20000 }).should(
    "eq",
    `/${lib}/${newName}/default`
  );
  cy.waitUntil(() => cy.get('[data-cy="slice-and-variation-name-header"]'));
  cy.get('[data-cy="slice-and-variation-name-header"]').contains(
    `/ ${newName} / Default`
  );
  cy.get("[data-cy=rename-slice-modal]").should("not.exist");
}