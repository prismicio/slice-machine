describe("Custom Types specs", () => {
  beforeEach(() => {
    cy.clearLocalStorageSnapshot();
    cy.cleanSliceMachineUserContext();
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

    cy.get('input[data-cy=ct-name-input]').type('My custom type')
    cy.get('input[data-cy=ct-id-input]').type('my-custom-type')
    cy.get('[data-cy=create-ct-modal]').submit()
    cy.location('pathname', {timeout: 5000}).should('eq', '/cts/my-custom-type')
    cy.visit('/cts/my-custom-type')
    cy.location('pathname', {timeout: 5000}).should('eq', '/cts/my-custom-type')
  })
})
