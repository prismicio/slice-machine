describe("Custom Types specs", () => {

  const name = "My Test"
  const id = "my-test"
  beforeEach(() => {
    cy.clearLocalStorageSnapshot();
    cy.cleanSliceMachineUserContext();
    cy.task("rmrf", `customtypes/${id}`)
  });

  it('A user can create a custom type', () => {
    cy.setupSliceMachineUserContext()
    cy.visit('/')
    // loading spinner
    cy.waitUntil(() => cy.get('[data-cy=create-ct]')).then(() => true)
    cy.get('[data-cy=create-ct]').click()
    cy
      .get('[data-cy=create-ct-modal]')
      .should('be.visible');

    cy.get('input[data-cy=ct-name-input]').type(name)
    cy.get('input[data-cy=ct-id-input]').type(id)
    cy.get('[data-cy=create-ct-modal]').submit()
    cy.location('pathname', {timeout: 5000}).should("eq", `/cts/${id}`)
    cy.visit(`/cts/${id}`)
    cy.location('pathname', {timeout: 5000}).should("eq", `/cts/${id}`)
  })
})
