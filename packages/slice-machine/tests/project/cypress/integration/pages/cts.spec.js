describe("onboarding skip", () => {
  it('displays create custom type button and modal', () => {
    cy.visit('/')
  
    cy.get('[create-ct]').click()

    cy
      .get('[data-cy=create-ct-modal]')
      .should('be.visible');  
  })
})
