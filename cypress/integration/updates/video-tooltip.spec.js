describe("video tooltip", () => {
  it("should display the tooltip when 'userContext.hasSeenTutorialsTooTip' is falsy and set to true when user clicks the close button", () => {
    cy.clearLocalStorage();
    cy.setupSliceMachineUserContext({
      hasSendAReview: true,
      isOnboarded: true,
      updatesViewed: {},
      hasSeenTutorialsTooTip: false,
      hasSeenSimulatorToolTip: true,
    });

    cy.visit("/");

    // There is a 5s timeout for displaying the tooltip
    cy.wait(10000);

    cy.get("[data-testid=video-tooltip]").should("exist");

    cy.get("[data-testid=video-tooltip-close-button]").click();

    cy.get("[data-testid=video-tooltip]").should("not.exist");

    cy.getSliceMachineUserContext().should((data) => {
      expect(data.hasSeenTutorialsTooTip).equal(
        true,
        "userContext.hasSeenTutorialsTooTip should set in local storage"
      );
    });
  });

  it("should no display when hasSeenTutorialsTooTip is truthy", () => {
    cy.clearLocalStorage();
    cy.setupSliceMachineUserContext({
      hasSendAReview: true,
      isOnboarded: true,
      updatesViewed: {},
      hasSeenTutorialsTooTip: true,
      hasSeenSimulatorToolTip: true,
    });

    // There is a 5s timeout for displaying the tooltip
    cy.wait(10000);

    cy.get("[data-testid=video-tooltip]").should("not.exist");
  });

  it("should close the tooltip when the user clicks the videos button", () => {
    cy.clearLocalStorage();
    cy.setupSliceMachineUserContext({
      hasSendAReview: true,
      isOnboarded: true,
      updatesViewed: {},
      hasSeenTutorialsTooTip: false,
      hasSeenSimulatorToolTip: true,
    });

    cy.visit("/");

    // There is a 5s timeout for displaying the tooltip
    cy.wait(10000);

    cy.get("[data-testid=video-tooltip]").should("exist");

    cy.get("[data-testid=video-toolbar] > a")
      .should("have.attr", "target", "_blank")
      .invoke("attr", "target", "")
      .invoke("attr", "href", "#")
      .click();

    cy.getSliceMachineUserContext().should((data) => {
      expect(data.hasSeenTutorialsTooTip).equal(
        true,
        "userContext.hasSeenTutorialsTooTip should set in local storage"
      );
    });
  });

  it("should disappear when the user hovers over the video toolbar", () => {
    cy.clearLocalStorage();
    cy.setupSliceMachineUserContext({
      hasSendAReview: true,
      isOnboarded: true,
      updatesViewed: {},
      hasSeenTutorialsTooTip: false,
      hasSeenSimulatorToolTip: true,
    });

    cy.visit("/");

    cy.get("[data-testid=video-tooltip]").should("exist");

    cy.get("[data-testid=video-toolbar]")
      .trigger("mouseenter")
      .trigger("mouseleave")
      .trigger("mouseover")
      .trigger("mousemove")
      .trigger("mouseout");

    cy.get("[data-testid=video-tooltip]").should("not.exist");

    cy.getSliceMachineUserContext().should((data) => {
      expect(data.hasSeenTutorialsTooTip).equal(
        true,
        "userContext.hasSeenTutorialsTooTip should set in local storage"
      );
    });
  });
});
