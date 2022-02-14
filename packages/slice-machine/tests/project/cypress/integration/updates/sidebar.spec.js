describe("update notification", () => {

  function addVersionsToResponseBody(body, patch = null, minor = null, major = null) {
    return {
      ...body,
      env: {
        ...body.env,
        updateVersionInfo: {
          ...body.env.updateVersionInfo,
          updateAvailable: true,
          availableVersions: {
            patch,
            minor,
            major,
          },
        }
      }
    }
  }

  it("updates available and user has not seen the notification", () => {
    cy.clearLocalStorageSnapshot()
    cy.setupSliceMachineUserContext()

    cy.intercept("/api/state", req => {
      req.continue(res => {
        res.body = addVersionsToResponseBody(res.body, "0.0.1", '0.1.0', '1.0.0')
      })
    })

    cy.visit("/")

    cy.get('[data-testid=the-red-dot]').should('exist')
  

    cy.contains("Learn more").click()

    cy.location("pathname", {timeout: 1000}).should('eq', '/changelog')

    cy.visit('/')

    cy.contains("Learn more").should('exist')
    cy.get('[data-testid=the-red-dot]').should('not.exist')

    cy.getLocalStorage("persist:root").then((str) => {
      console.log(str)
      const obj = JSON.parse(str)
      const userContext = JSON.parse(obj.userContext)

      expect(userContext.viewedUpdates).to.deep.equal({patch: "0.0.1", minor: "0.1.0", major: "1.0.0"})
    })
  })


  it("updates available and user has seen the notification", () => {

    cy.clearLocalStorageSnapshot()
    cy.setupSliceMachineUserContext(true, true, {patch: "0.0.1", minor: "0.1.0", major: "1.0.0"})

    cy.intercept("/api/state", req => {
      req.continue(res => {
        res.body = addVersionsToResponseBody(res.body, "0.0.1", '0.1.0', '1.0.0')
      })
    })

    cy.visit("/")
    cy.contains("Learn more").should('exist')
    cy.get('[data-testid=the-red-dot]').should('not.exist')
  
  })

  it("user has seen the updates but an even newer on is available", () => {

    cy.clearLocalStorageSnapshot()
    cy.setupSliceMachineUserContext(true, true, {patch: "0.0.1", minor: "0.2.0", major: "1.0.0"})

    cy.intercept("/api/state", req => {
      req.continue(res => {
        res.body = addVersionsToResponseBody(res.body, "0.0.1", '0.1.0', '1.0.0')
      })
    })

    cy.visit("/")
    cy.contains("Learn more").should('exist')
    cy.get('[data-testid=the-red-dot]').should('exist')
  
  })
})