describe("onboarding skip", () => {

  before(() => {
    cy.clearLocalStorageSnapshot();
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
  });

  it('tracking events sent when the user skips the onboarding', () => {
    const ids = [
      "slicemachine_onboarding_start",
      "slicemachine_onboarding_continue_screen_intro",
      "slicemachine_onboarding_skip",
    ]
  
    cy.intercept('POST', '/api/tracking/onboarding', ({body}) => {
      expect(body.id).equal(ids.shift())
    })
  
    cy.visit('/onboarding')
  
    cy.get('[data-cy=get-started]').click()
  
    cy.get('[data-cy=skip-onboarding]').click()
  
    cy.location('pathname', {timeout: 1000}).should('eq', '/')
  
    cy.getLocalStorage("persist:root").should('eq', '{"userContext":"{\\"hasSendAReview\\":false,\\"isOnboarded\\":true}","_persist":"{\\"version\\":-1,\\"rehydrated\\":true}"}')
  })
})
