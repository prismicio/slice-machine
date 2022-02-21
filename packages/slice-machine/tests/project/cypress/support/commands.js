import "cypress-localstorage-commands"
import 'cypress-wait-until';

Cypress.Commands.add('setupSliceMachineUserContext', (hasSendAReview = true, isOnboarded = true, updatesViewed = {}) => {
  return cy.setLocalStorage("persist:root", JSON.stringify({
    userContext: JSON.stringify({
      hasSendAReview,
      isOnboarded,
      updatesViewed: {
        latest: null,
        latestNonBreaking: null,
        ...updatesViewed
      }
    })
  }))
})

Cypress.Commands.add('cleanSliceMachineUserContext', (hasSendAReview = true, isOnboarded = true) => {
  return cy.removeLocalStorage("persist:root")
})