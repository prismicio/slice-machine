describe("update notification", () => {
  function addVersionsToResponseBody(body, latestNonBreakingVersion, versions) {
    return {
      ...body,
      env: {
        ...body.env,
        changelog: {
          ...body.env.changelog,
          updateAvailable: true,
          latestNonBreakingVersion,
          versions,
        },
      },
    };
  }

  it("updates available and user has not seen the notification", () => {
    cy.clearLocalStorageSnapshot();
    cy.setupSliceMachineUserContext();

    cy.intercept("/api/state", (req) => {
      req.continue((res) => {
        res.body = addVersionsToResponseBody(res.body, "1.2.3", [
          {
            versionNumber: "1000.0.0",
            status: "MAJOR",
            releaseNote: null,
          },
        ]);
      });
    });

    cy.visit("/");

    cy.get("[data-testid=the-red-dot]").should("exist");

    cy.contains("Learn more").click();

    cy.location("pathname", { timeout: 1000 }).should("eq", "/changelog");

    cy.visit("/");

    cy.contains("Learn more").should("exist");

    cy.get("[data-testid=the-red-dot]").should("not.exist");

    cy.getLocalStorage("persist:root").then((str) => {
      console.log(str);
      const obj = JSON.parse(str);
      const userContext = JSON.parse(obj.userContext);

      expect(userContext.updatesViewed).to.deep.equal({
        latest: "1000.0.0",
        latestNonBreaking: "1.2.3",
      });
    });
  });

  it("updates available and user has seen the notification", () => {
    cy.clearLocalStorageSnapshot();
    cy.setupSliceMachineUserContext(true, true, {
      latest: "1000.0.0",
      latestNonBreaking: "1.2.3",
    });

    cy.intercept("/api/state", (req) => {
      req.continue((res) => {
        res.body = addVersionsToResponseBody(res.body, "1.2.3", [
          {
            versionNumber: "1000.0.0",
            status: "MAJOR",
            releaseNote: null,
          },
        ]);
      });
    });

    cy.visit("/");
    cy.contains("Learn more", { timeout: 20000 }).should("exist");
    cy.get("[data-testid=the-red-dot]").should("not.exist");
  });

  it("user has seen the updates but an even newer on is available", () => {
    cy.clearLocalStorageSnapshot();
    cy.setupSliceMachineUserContext(true, true, {
      latest: "999.0.0",
      latestNonBreaking: "1.2.3",
    });

    cy.intercept("/api/state", (req) => {
      req.continue((res) => {
        res.body = addVersionsToResponseBody(res.body, "1.2.3", [
          {
            versionNumber: "1000.0.0",
            status: "MAJOR",
            releaseNote: null,
          },
        ]);
      });
    });

    cy.visit("/");
    cy.contains("Learn more").should("exist");
    cy.get("[data-testid=the-red-dot]").should("exist");
  });
});
