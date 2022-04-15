describe("onboarding finish", () => {
  beforeEach(() => {
    cy.clearLocalStorageSnapshot();
    cy.cleanSliceMachineUserContext();
  });

  it("begin button and continue button eventually redirect to /", () => {
    const closeReviewSelector = "[data-cy=close-review]";

    cy.visit("/onboarding");

    // close the popup
    cy.get("body").then((body) => {
      body.find(closeReviewSelector).length &&
        cy.get(closeReviewSelector).click();
    });

    cy.get("[data-cy=get-started]").click();

    const clickContinue = () => cy.get("[data-cy=continue]").click();

    for (let i = 0; i <= 2; i++) {
      clickContinue();
    }

    cy.location("pathname", { timeout: 1000 }).should("eq", "/");
  });
});
