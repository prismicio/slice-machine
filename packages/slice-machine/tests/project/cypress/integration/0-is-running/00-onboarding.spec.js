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
    cy.location('pathname', {timeout: 1000}).should('eq', '/onboarding')
    cy.wait(1000)
    cy.getLocalStorage("is-onboarded").should('eq', 'true')
  })

  it('when is-onboarded is in local storage it should not redirect', () => {
    cy.visit('/')
    cy.location('pathname', {timeout: 1000}).should('eq', '/')
  })

  it('begin button and continue button eventually redirect to /', () => {
    const closeReviewSelector = '[data-cy=close-review]'

    cy.visit('/onboarding')

    // close the popup 
    cy.get('body').then(body => {
      body.find(closeReviewSelector).length && cy.get(closeReviewSelector).click()
    })
    cy.get('[data-cy=get-started]').click()

    const clickContinue = () => cy.get('[data-cy=continue]').click()
    
    for (let i = 0; i <= 2; i++) {
      clickContinue()
    }

    cy.location('pathname', {timeout: 1000}).should('eq', '/')

  })

  it('user can skip the onboarding', () => {
    cy.visit('/onboarding')
    cy.get('[data-cy=get-started]').click()
    cy.get('[data-cy=skip-onboarding]').click()

    cy.location('pathname', {timeout: 1000}).should('eq', '/')
    cy.getLocalStorage("is-onboarded").should('eq', 'true')
  })
})
