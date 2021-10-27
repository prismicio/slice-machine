/// <reference types="cypress" />

describe('onboarding', () => {

  before(() => {
    cy.clearLocalStorageSnapshot();
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });

  it('should redirect to /onboarding when is-onboared is not in local storage', () => {
    cy.visit('/')
    cy.wait(1000)
    cy.url().should('eq', 'http://localhost:9999/onboarding')
    cy.getLocalStorage("is-onboarded").should('eq', 'true')
  })

  it('when is-onboarded is in local storage it should not redirect', () => {
    cy.visit('/')
    cy.url().should('eq', 'http://localhost:9999/')
  })
})