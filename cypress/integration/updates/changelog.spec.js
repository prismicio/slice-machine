describe("changelog.warningBreakingChanges", () => {
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

  it("shows warning if the selected release note has a breaking changes title.", () => {
    cy.clearLocalStorageSnapshot();
    cy.setupSliceMachineUserContext({
      hasSendAReview: true,
      isOnboarded: true,
      updatesViewed: {
        latest: "1000.0.0",
        latestNonBreaking: "1.2.3",
      },
      hasSeenTutorialsTooTip: true
    });

    cy.intercept("/api/state", (req) => {
      req.continue((res) => {
        res.body = addVersionsToResponseBody(res.body, "1.2.3", [
          {
            versionNumber: "1000.0.0",
            status: "PATCH",
            releaseNote:
              "### Breaking Changes\n -this changes is breaking your slice machine",
          },
        ]);
      });
    });

    cy.visit("/changelog");
    cy.get("[data-testid=breaking-changes-warning]").should("exist");
  });

  it("should not display the warning if the selected release note does not have a breaking changes title.", () => {
    cy.clearLocalStorageSnapshot();
    cy.setupSliceMachineUserContext({
      hasSendAReview: true,
      isOnboarded: true,
      updatesViewed: {
        latest: "1000.0.0",
        latestNonBreaking: "1.2.3",
      },
      hasSeenTutorialsTooTip: true
    });
    

    cy.intercept("/api/state", (req) => {
      req.continue((res) => {
        res.body = addVersionsToResponseBody(res.body, "1.2.3", [
          {
            versionNumber: "1000.0.0",
            status: "PATCH",
            releaseNote: "This release does not include Breaking Changes",
          },
        ]);
      });
    });

    cy.visit("/changelog");
    cy.get("[data-testid=breaking-changes-warning]").should("not.exist");
  });
});
