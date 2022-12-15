describe("update notification", () => {  
  function mockStateCall() {
    cy.intercept("/api/state", (req) => {
      req.continue((res) => {
        res.body =  {
          ...res.body,
          env: {
            ...res.body.env,
            changelog: {
              ...res.body.env.changelog,
              updateAvailable: true,
              latestNonBreakingVersion: "1.2.3",
              versions: [
                {
                  versionNumber: "1000.0.0",
                  status: "MAJOR",
                  releaseNote: null
                },
              ],
            },
          },
        };
      });
    });
  }

  it("updates available and user has not seen the notification", () => {
    cy.setSliceMachineUserContext({
      hasSendAReview: true,
      isOnboarded: true,
      updatesViewed: {},
      hasSeenTutorialsTooTip: true,
    });
   
    mockStateCall();

    cy.visit("/");
    cy.get("[data-testid=the-red-dot]").should("exist");
    cy.contains("Learn more").click();
    cy.location("pathname", { timeout: 1000 }).should("eq", "/changelog");
    
    cy.visit("/");
    cy.contains("Learn more").should("exist");
    cy.get("[data-testid=the-red-dot]").should("not.exist");

    cy.getLocalStorage("persist:root").then((str) => {
      const obj = JSON.parse(str);
      const userContext = JSON.parse(obj.userContext);

      expect(userContext.updatesViewed).to.deep.equal({
        latest: "1000.0.0",
        latestNonBreaking: "1.2.3",
      });
    });
  });

  it("updates available and user has seen the notification", () => {
    cy.setSliceMachineUserContext({
      hasSendAReview: true,
      isOnboarded: true,
      updatesViewed: {
        latest: "1000.0.0",
        latestNonBreaking: "1.2.3",
      },
      hasSeenTutorialsTooTip: true,
    });
    
    mockStateCall();

    cy.visit("/");
    cy.contains("Learn more", { timeout: 60000 }).should("exist");
    cy.get("[data-testid=the-red-dot]").should("not.exist");
  });

  it("user has seen the updates but an even newer on is available", () => {
    cy.setSliceMachineUserContext({
      hasSendAReview: true,
      isOnboarded: true,
      updatesViewed: {
        latest: "999.0.0",
        latestNonBreaking: "1.2.3",
      },
      hasSeenTutorialsTooTip: true,
    });

    mockStateCall();

    cy.visit("/");
    cy.contains("Learn more").should("exist");
    cy.get("[data-testid=the-red-dot]").should("exist");
  });
});
