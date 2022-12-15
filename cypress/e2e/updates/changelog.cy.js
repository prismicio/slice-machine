describe("changelog.warningBreakingChanges", () => {
  beforeEach(() => {
    cy.setSliceMachineUserContext({
      hasSendAReview: true,
      isOnboarded: true,
      updatesViewed: {
        latest: "1000.0.0",
        latestNonBreaking: "1.2.3",
      },
      hasSeenTutorialsTooTip: true,
    });
  });

  function mockStateCall(releaseNote) {
    cy.intercept("/api/state", (req) => {
      req.continue((res) => {
        res.body = {
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
                  status: "PATCH",
                  releaseNote,
                },
              ],
            },
          },
        };
      });
    });
  }

  it("shows warning if the selected release note has a breaking changes title.", () => {
    mockStateCall(
      "### Breaking Changes\n -this changes is breaking your slice machine"
    );
    cy.visit("/changelog");
    cy.get("[data-testid=breaking-changes-warning]").should("exist");
  });

  it("should not display the warning if the selected release note does not have a breaking changes title.", () => {
    mockStateCall("This release does not include Breaking Changes");
    cy.visit("/changelog");
    cy.get("[data-testid=breaking-changes-warning]").should("not.exist");
  });
});
