import "cypress-localstorage-commands";

/**
 * Set the user context in the local storage.
 *
 * @param {{
 *   hasSendAReview: boolean;
 *   hasSeenTutorialsToolTip: boolean;
 *   hasSeenSimulatorToolTip: boolean;
 *   lastSyncChange: number | null;
 * }} data Object that represent the userContext.
 */
export function setSliceMachineUserContext({
  hasSendAReview = true,
  hasSeenTutorialsToolTip = true,
  hasSeenSimulatorToolTip = true,
  lastSyncChange = null,
}) {
  return cy.setLocalStorage(
    "persist:root",
    JSON.stringify({
      userContext: JSON.stringify({
        hasSendAReview,
        hasSeenTutorialsToolTip,
        lastSyncChange,
        hasSeenSimulatorToolTip,
      }),
    }),
  );
}

/** Retrieve the user context from the local storage */
export function getSliceMachineUserContext() {
  return cy
    .getLocalStorage("persist:root")
    .then((data) => JSON.parse(data))
    .then(({ userContext }) => JSON.parse(userContext));
}
