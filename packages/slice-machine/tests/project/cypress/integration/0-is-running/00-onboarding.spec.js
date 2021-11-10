/// <reference types="cypress" />

describe('onboarding', {retries: {
  runMode: 1,
  openMode: 0,
}}, () => {

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
    cy.visit('/')
    cy.location('pathname', {timeout: 1000}).should('eq', '/')
  })

  it('begin button and continue button eventually redirect to /', () => {

    const ids = [
      "slicemachine_onboarding_start",
      "slicemachine_onboarding_continue_screen_intro",
      "slicemachine_onboarding_continue_1",
      "slicemachine_onboarding_continue_2",
      "slicemachine_onboarding_continue_3",
    ]
    cy.intercept('POST', '/tracking/onboarding', ({body}) => {
      expect(body.id).equal(ids.shift())
    })

    const closeReviewSelector = '[data-cy=close-review]'

    cy.visit('/onboarding')

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


    cy.location('pathname', {timeout: 1000}).should('eq', '/')

  })

  it('user can skip the onboarding', () => {

    const ids = [
      "slicemachine_onboarding_start",
      "slicemachine_onboarding_continue_screen_intro",
      "slicemachine_onboarding_skip",
    ]

    cy.intercept('POST', '/tracking/onboarding', ({body}) => {
      expect(body.id).equal(ids.shift())
    })

    cy.visit('/onboarding')

    cy.get('[data-cy=get-started]').click()

    cy.get('[data-cy=skip-onboarding]').click()

    cy.location('pathname', {timeout: 1000}).should('eq', '/')

    cy.getLocalStorage("is-onboarded").should('eq', 'true')
  })
})
