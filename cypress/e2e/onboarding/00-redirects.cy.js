describe("onboarding redirects and local storage", () => {
  beforeEach(() => {
    cy.clearLocalStorageSnapshot();
  });

  it("should redirect to /onboarding when is-onboarded is not in local storage", () => {
    cy.cleanSliceMachineUserContext();
    cy.visit("/");
    cy.waitUntil(() => cy.get("[data-cy=get-started]")).then(() => true);
    cy.location("pathname", { timeout: 5000 }).should("eq", "/onboarding");
  });

  it("when is-onboarded is in local storage it should not redirect", () => {
    cy.setupSliceMachineUserContext({
      hasSendAReview: true,
      isOnboarded: true,
      updatesViewed: {},
      hasSeenTutorialsTooTip: true,
      hasSeenSimulatorToolTip: true,
    });
    cy.visit("/");
    cy.location("pathname", { timeout: 5000 }).should("eq", "/");
  });
});
