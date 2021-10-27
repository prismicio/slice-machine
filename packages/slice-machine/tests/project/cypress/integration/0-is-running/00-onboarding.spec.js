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
    cy.url().should('eq', 'http://localhost:9999/onboarding')
    cy.wait(1000)
    cy.getLocalStorage("is-onboarded").should('eq', 'true')
  })

  it('when is-onboarded is in local storage it should not redirect', () => {
    cy.visit('/')
    cy.url().should('eq', 'http://localhost:9999/')
  })

  it('begin button and continue button eventually redirect to /', () => {
    const closeReviewSelector = '[data-cy=close-review]'

    cy.visit('/onboarding')
    cy.wait(1000)

    // close the popup 
    cy.get('body').then(body => {
      body.find(closeReviewSelector).length && cy.get(closeReviewSelector).click()
    })
    cy.get('[data-cy=get-started]').click()

    const continueSelector = '[data-cy=continue]'

    const clickContinue = () => cy.get(continueSelector).click()
    clickContinue()
    clickContinue()
    clickContinue()

    cy.wait(1000)

    cy.location('pathname').should('eq', '/')

  })
})