/** This test needs to run AFTER create_slice. const values below are copied from there. */
describe("simulator tooltip", () => {
  const lib = "slices";
  const sliceName = "DuplicateSlices";
  it("should display the tooltip when 'userContext.hasSeenSimulatorToolTip' is falsy and set to true when user clicks the close button", () => {
    cy.clearLocalStorage();
    cy.setupSliceMachineUserContext({
      hasSendAReview: true,
      isOnboarded: true,
      updatesViewed: {},
      hasSeenTutorialsTooTip: true,
      hasSeenSimulatorToolTip: false,
    });

    cy.visit(`/${lib}/${sliceName}/default`);

    // There is a 6s timeout for displaying the tooltip
    cy.wait(6000);

    cy.get("[data-testid=simulator-tooltip]").should("exist");

    cy.get("[data-testid=simulator-tooltip-close-button]").click();

    cy.get("[data-testid=simulator-tooltip]").should("not.exist");

    cy.getSliceMachineUserContext().should((data) => {
      expect(data.hasSeenSimulatorToolTip).equal(
        true,
        "userContext.hasSeenSimulatorToolTip should set in local storage"
      );
    });
  });

  it("should not display when hasSeenSimulatorToolTip is truthy", () => {
    cy.clearLocalStorage();
    cy.setupSliceMachineUserContext({
      hasSendAReview: true,
      isOnboarded: true,
      updatesViewed: {},
      hasSeenTutorialsTooTip: true,
      hasSeenSimulatorToolTip: true,
    });

    cy.visit(`/${lib}/${sliceName}/default`);

    // There is a 6s timeout for displaying the tooltip
    cy.wait(6000);

    cy.get("[data-testid=simulator-tooltip]").should("not.exist");
  });

  it("should close the tooltip when the user clicks the simulator button", () => {
    cy.clearLocalStorage();
    cy.setupSliceMachineUserContext({
      hasSendAReview: true,
      isOnboarded: true,
      updatesViewed: {},
      hasSeenTutorialsTooTip: true,
      hasSeenSimulatorToolTip: false,
    });

    cy.visit(`/${lib}/${sliceName}/default`);

    // There is a 6s timeout for displaying the tooltip
    cy.wait(6000);

    cy.get("[data-testid=simulator-tooltip]").should("exist");

    // Don't open the Simulator's window.
    cy.window().then((win) => {
      cy.stub(win, "open").as("Open");
    });

    cy.get("[data-testid=simulator-open-button]").click();

    cy.getSliceMachineUserContext().should((data) => {
      expect(data.hasSeenSimulatorToolTip).equal(
        true,
        "userContext.hasSeenSimulatorToolTip should set in local storage"
      );
    });
  });
});
