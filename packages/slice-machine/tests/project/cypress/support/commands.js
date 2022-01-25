import "cypress-localstorage-commands"

Cypress.Commands.add('setupSliceMachineUserContext', (hasSendAReview = true, isOnboarded = true) => {
  return cy.setLocalStorage("persist:root", JSON.stringify({userContext: JSON.stringify({hasSendAReview, isOnboarded})}))
})

Cypress.Commands.add('cleanSliceMachineUserContext', (hasSendAReview = true, isOnboarded = true) => {
  return cy.removeLocalStorage("persist:root")
})
