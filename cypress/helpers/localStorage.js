import "cypress-localstorage-commands";

export function setSliceMachineUserContext({
  hasSendAReview = true, // boolean
  isOnboarded = true, // boolean
  updatesViewed = { latest: null, latestNonBreaking: null }, // object
  hasSeenTutorialsTooTip = true, // boolean,
  lastSyncChange = null // number - timestamp
}) {
  return cy.setLocalStorage(
    "persist:root",
    JSON.stringify({
      userContext: JSON.stringify({
        hasSendAReview,
        isOnboarded,
        updatesViewed,
        hasSeenTutorialsTooTip,
        lastSyncChange
      }),
    })
  );
}

export function getSliceMachineUserContext() {
  return cy
    .getLocalStorage("persist:root")
    .then((data) => JSON.parse(data))
    .then(({ userContext }) => JSON.parse(userContext));
}
