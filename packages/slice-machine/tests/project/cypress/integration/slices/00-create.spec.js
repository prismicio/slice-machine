describe("Create Slices", () => {
  const name = "TestSlice"
  const lib = "slices"
  beforeEach(() => {
    cy.clearLocalStorageSnapshot();
    cy.cleanSliceMachineUserContext();
    cy.task("rmrf", `${lib}/${name}`)
  });

  it('A user can create a slice', () => {
    cy.setupSliceMachineUserContext()
    cy.visit(`/${lib}`)
    cy.waitUntil(() => cy.get('[data-cy=create-slice]'))
    cy.get('[data-cy=create-slice]').click()
    cy
      .get('[data-cy=create-slice-modal]')
      .should('be.visible');

    cy.get('input[data-cy=slice-name-input]').type(name)
    cy.get('[data-cy=create-slice-modal]').submit()
    cy.location('pathname', {timeout: 5000}).should('eq', `/${lib}/${name}/default-slice`)
    cy.visit(`/${lib}/${name}/default-slice`)
    cy.location('pathname', {timeout: 5000}).should('eq', `/${lib}/${name}/default-slice`)
  })
})
