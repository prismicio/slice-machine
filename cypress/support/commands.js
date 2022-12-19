import "cypress-localstorage-commands";
import "cypress-wait-until";

Cypress.Commands.add(
  "setupSliceMachineUserContext",
  ({
    hasSendAReview, // boolean
    isOnboarded, // boolean
    updatesViewed, // object
    hasSeenTutorialsTooTip, // boolean
    hasSeenSimulatorToolTip, // boolean,
  }) => {
    return cy.setLocalStorage(
      "persist:root",
      JSON.stringify({
        userContext: JSON.stringify({
          hasSendAReview,
          isOnboarded,
          updatesViewed: {
            latest: null,
            latestNonBreaking: null,
            ...updatesViewed,
          },
          hasSeenTutorialsTooTip,
          hasSeenSimulatorToolTip,
        }),
      })
    );
  }
);

Cypress.Commands.add(
  "cleanSliceMachineUserContext",
  (hasSendAReview = true, isOnboarded = true) => {
    return cy.removeLocalStorage("persist:root");
  }
);

Cypress.Commands.add("getSliceMachineUserContext", () => {
  return cy
    .getLocalStorage("persist:root")
    .then((data) => JSON.parse(data))
    .then(({ userContext }) => JSON.parse(userContext));
});

Cypress.Commands.add("getInputByLabel", (label) => {
  return cy
    .contains("label", label)
    .invoke("attr", "for")
    .then((id) => {
      const selector = `#${id},[name="${id}"]`
      return cy.get(selector)
    })
})
