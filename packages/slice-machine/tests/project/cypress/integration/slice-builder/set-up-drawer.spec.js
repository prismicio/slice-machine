describe("setup drawer", () => {

  before(() => {
    cy.clearLocalStorage()
    cy.setLocalStorage("persist:root", JSON.stringify({userContext: JSON.stringify({isOnboarded: true})}))
  })

  it('should open thhe set up drawer', () => {
    cy.visit('/slices/AllFields/default-slice')
    cy.contains('Setup the preview').click()
    cy.contains('Create a page for Slice Canvas').click()
  })
})