/// <reference types="cypress" />

describe("check slicemachine is running", () => {

  beforeEach(() => {
    cy.removeLocalStorage()
  })

  it('visit http://localhost:9999', () => {
    cy.visit('http://localhost:9999')
  })
})