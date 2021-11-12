/// <reference types="cypress" />

describe('onboarding redirects and local storage', () => {

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
    cy.intercept('POST', '/tracking/onboarding', ({body}) => {
      expect(body.id).equal("slicemachine_onboarding_start")
    })
    
    cy.visit('/')

    cy.location('pathname', {timeout: 1000}).should('eq', '/onboarding')

    cy.wait(1500)
    cy.getLocalStorage("is-onboarded").should('eq', 'true')
  })

  it('when is-onboarded is in local storage it should not redirect', () => {
    cy.setLocalStorage("is-onboarded", true)
    cy.visit('/')
    cy.location('pathname', {timeout: 1000}).should('eq', '/')
  })
})
