describe("onboarding skip", () => {
  beforeEach(() => {
    cy.cleanSliceMachineUserContext();
  });

  it("tracking events sent when the user skips the onboarding", () => {
    cy.visit("/onboarding");

    cy.get("[data-cy=get-started]").click();

    cy.get("[data-cy=skip-onboarding]").click();

    cy.location("pathname", { timeout: 5000 }).should("eq", "/");

    cy.getLocalStorage("persist:root").should(
      "include",
      '\\"isOnboarded\\":true,'
    );
  });
});
