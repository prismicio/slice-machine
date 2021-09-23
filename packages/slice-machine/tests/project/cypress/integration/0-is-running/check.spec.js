/// <reference types="cypress" />

describe("check slicemachine is running", () => {
  it('visit http://localhost:9999', () => {
    cy.visit('http://localhost:9999')
  })
})