describe("video tooltip", () => {

  it("should display the tooltip when 'userContext.viewedVideosToolTip' is falsy and set to true when user clicks the lose button", () => {
    cy.clearLocalStorage()
    cy.setupSliceMachineUserContext(true, true, {}, false)

    cy.visit("/")

    cy.get("[data-testid=video-tooltip]").should("exist")

    cy.get("[data-testid=video-tooltip-close-button]").click()

    cy.get("[data-testid=video-tooltip]").should("not.exist")

    cy.getSliceMachineUserContext().should(data => {
      expect(data.viewedVideosToolTip).equal(true, "userContext.viewedVideosToolTip should set in local storage")
    })
  })

  it("should no display when viewedVideosToolTip is truthy", () => {
    cy.clearLocalStorage()
    cy.setupSliceMachineUserContext(true, true, {}, true)
    cy.get("[data-testid=video-tooltip]").should("not.exist")
  })

  it('should close the tooltip when the user clicks the videos button', () => {
    cy.clearLocalStorage()
    cy.setupSliceMachineUserContext(true, true, {}, false)
    
    cy.visit("/")

    cy.get("[data-testid=video-tooltip]").should("exist")

    cy.get("[data-testid=video-toolbar] > a")
    .should('have.attr', 'target', '_blank')
    .invoke("attr", "target", "")
    .invoke("attr", "href", "#")
    .click()

    cy.getSliceMachineUserContext().should(data => {
      expect(data.viewedVideosToolTip).equal(true, "userContext.viewedVideosToolTip should set in local storage")
    })
  })

  it('should disappear when the user hovers over the video toolbar', () => {
    cy.clearLocalStorage()
    cy.setupSliceMachineUserContext(true, true, {}, false)
    
    cy.visit("/")

    cy.get("[data-testid=video-tooltip]").should("exist")

    cy.get("[data-testid=video-toolbar]")
    .trigger("mouseenter")
    .trigger("mouseleave")
    .trigger("mouseover")
    .trigger("mousemove")
    .trigger("mouseout")

    cy.get("[data-testid=video-tooltip]").should("not.exist")

    cy.getSliceMachineUserContext().should(data => {
      expect(data.viewedVideosToolTip).equal(true, "userContext.viewedVideosToolTip should set in local storage")
    })
  })
})