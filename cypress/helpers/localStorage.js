import "cypress-localstorage-commands";

export function setSliceMachineUserContext({
  hasSendAReview, // boolean
  isOnboarded, // boolean
  updatesViewed, // object
  hasSeenTutorialsTooTip, // boolean
}) {
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
      }),
    })
  );
}

export function cleanSliceMachineUserContext(
  hasSendAReview = true,
  isOnboarded = true
) {
  return cy.removeLocalStorage("persist:root");
}

export function getSliceMachineUserContext() {
  return cy
    .getLocalStorage("persist:root")
    .then((data) => JSON.parse(data))
    .then(({ userContext }) => JSON.parse(userContext));
}
