
describe("onboarding finish", () => {

  it('begin button and continue button eventually redirect to /', () => {

    const ids = [
      "slicemachine_onboarding_start",
      "slicemachine_onboarding_continue_screen_intro",
      "slicemachine_onboarding_continue_screen_1",
      "slicemachine_onboarding_continue_screen_2",
      "slicemachine_onboarding_continue_screen_3",
    ]

    cy.intercept('POST', '/api/tracking/onboarding', ({body}) => {
      expect(body.id).equal(ids.shift())
    })
  
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
  
})
