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

  it('should redirect to /onboarding when is-onboarded is not in local storage', () => {
    cy.intercept('POST', '/api/tracking/onboarding', ({body}) => {
      expect(body.id).equal("slicemachine_onboarding_start")
    })
    
    cy.visit('/')

    cy.location('pathname', {timeout: 1000}).should('eq', '/onboarding')
  })

  it('when is-onboarded is in local storage it should not redirect', () => {
    cy.setLocalStorage("persist:root", JSON.stringify({userContext: JSON.stringify({isOnboarded: true})}))
    cy.visit('/')
    cy.location('pathname', {timeout: 1000}).should('eq', '/')
  })
})
