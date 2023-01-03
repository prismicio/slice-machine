import "cypress-localstorage-commands";

/**
 * Set the user context in the local storage.
 *
 * @param {{
 *  hasSendAReview: boolean,
 *  isOnboarded: boolean,
 *  updatesViewed: {
 *    latest: number | null,
 *    latestNonBreaking: number | null
 *  },
 *  hasSeenTutorialsTooTip: boolean,
 *  hasSeenSimulatorToolTip: boolean,
 *  lastSyncChange: number | null
 * }} data Object that represent the userContext.
 */
export function setSliceMachineUserContext({
  hasSendAReview = true,
  isOnboarded = true,
  updatesViewed = { latest: null, latestNonBreaking: null },
  hasSeenTutorialsTooTip = true,
  hasSeenSimulatorToolTip = true,
  lastSyncChange = null,
}) {
  return cy.setLocalStorage(
    "persist:root",
    JSON.stringify({
      userContext: JSON.stringify({
        hasSendAReview,
        isOnboarded,
        updatesViewed,
        hasSeenTutorialsTooTip,
        lastSyncChange,
        hasSeenSimulatorToolTip,
      }),
    })
  );
}

/**
 * Retrieve the user context from the local storage
*/
export function getSliceMachineUserContext() {
  return cy
    .getLocalStorage("persist:root")
    .then((data) => JSON.parse(data))
    .then(({ userContext }) => JSON.parse(userContext));
}
