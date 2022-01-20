describe("Custom Types specs", () => {
  before(() => {
    cy.clearLocalStorageSnapshot();
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
  });

  it('A user can create a custom type', () => {
    cy.setupSliceMachineUserContext()
    cy.visit('/')
    cy.get('[data-cy=create-ct]').click()
    cy
      .get('[data-cy=create-ct-modal]')
      .should('be.visible');

    cy.get('input[data-cy=ct-name-input]').type('My custom type')
    cy.get('input[data-cy=ct-id-input]').type('my-custom-type')
    cy.get('[data-cy=create-ct-modal]').submit()
    cy.location('pathname', {timeout: 5000}).should('eq', '/cts/my-custom-type')
  })
})
