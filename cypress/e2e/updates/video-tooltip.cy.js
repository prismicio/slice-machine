describe("video tooltip", () => {
  it("should display the tooltip when 'userContext.hasSeenTutorialsToolTip' is falsy and set to true when user clicks the close button", () => {
    cy.setSliceMachineUserContext({ hasSeenTutorialsToolTip: false });

    cy.visit("/");

    cy.get("[role=tooltip]", { timeout: 6_000 }).should("have.class", "show");

    cy.get("[data-testid=video-tooltip-close-button]").click();

    cy.get("[data-testid=video-tooltip]").should("not.exist");

    cy.getSliceMachineUserContext().then((data) => {
      expect(data.hasSeenTutorialsToolTip).equal(
        true,
        "userContext.hasSeenTutorialsToolTip should set in local storage"
      );
    });
  });

  it("should no display when hasSeenTutorialsToolTip is truthy", () => {
    cy.setSliceMachineUserContext({});

    cy.get("[role=tooltip]", { timeout: 6_000 }).should("not.exist");
  });

  it("should close the tooltip when the user clicks the videos button", () => {
    cy.setSliceMachineUserContext({ hasSeenTutorialsToolTip: false });

    cy.visit("/");

    cy.get("[role=tooltip]", { timeout: 6_000 }).should("have.class", "show");

    cy.contains("Tutorial")
      .should("have.attr", "target", "_blank")
      .should(
        "have.attr",
        "href",
        "https://youtube.com/playlist?list=PLUVZjQltoA3wnaQudcqQ3qdZNZ6hyfyhH"
      )
      .click();

    cy.getSliceMachineUserContext().should((data) => {
      expect(data.hasSeenTutorialsToolTip).equal(
        true,
        "userContext.hasSeenTutorialsToolTip should set in local storage"
      );
    });
  });

  it("should disappear when the user hovers over the video toolbar", () => {
    cy.setSliceMachineUserContext({ hasSeenTutorialsToolTip: false });

    cy.visit("/");

    cy.get("[role=tooltip]", { timeout: 6_000 }).should("have.class", "show");

    cy.contains("Tutorial")
      .trigger("mouseenter")
      .trigger("mouseleave")
      .trigger("mouseover")
      .trigger("mousemove")
      .trigger("mouseout");

    cy.get("[data-testid=video-tooltip]").should("not.exist");

    cy.getSliceMachineUserContext().should((data) => {
      expect(data.hasSeenTutorialsToolTip).equal(
        true,
        "userContext.hasSeenTutorialsToolTip should set in local storage"
      );
    });
  });
});
