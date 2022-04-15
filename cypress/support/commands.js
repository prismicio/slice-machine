import "cypress-localstorage-commands"
import 'cypress-wait-until';

Cypress.Commands.add('setupSliceMachineUserContext', (hasSendAReview = true, isOnboarded = true, updatesViewed = {}, hasSeenTutorialsTooTip = false) => {
  return cy.setLocalStorage("persist:root", JSON.stringify({
    userContext: JSON.stringify({
      hasSendAReview,
      isOnboarded,
      updatesViewed: {
        latest: null,
        latestNonBreaking: null,
        ...updatesViewed
      },
      hasSeenTutorialsTooTip,
    })
  }))
})

Cypress.Commands.add('cleanSliceMachineUserContext', (hasSendAReview = true, isOnboarded = true) => {
  return cy.removeLocalStorage("persist:root")
})

Cypress.Commands.add("getSliceMachineUserContext", () => {
  return cy.getLocalStorage("persist:root").then(data => JSON.parse(data)).then(({userContext}) => JSON.parse(userContext))
})