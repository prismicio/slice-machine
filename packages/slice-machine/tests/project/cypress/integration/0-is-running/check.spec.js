/// <reference types="cypress" />

describe("check slicemachine is running", () => {

  before(() => {
    cy.clearLocalStorageSnapshot();
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });

  it('visit http://localhost:9999', () => {
    cy.visit('http://localhost:9999')
  })
})