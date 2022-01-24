import "cypress-localstorage-commands"

Cypress.Commands.add('setupSliceMachineUserContext', (hasSendAReview = true, isOnboarded = true) => {
  cy.setLocalStorage("persist:root", JSON.stringify({userContext: JSON.stringify({hasSendAReview, isOnboarded})}))
})