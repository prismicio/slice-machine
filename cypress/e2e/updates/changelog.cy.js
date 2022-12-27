describe("changelog.warningBreakingChanges", () => {
  beforeEach(() => {
    cy.setSliceMachineUserContext({
      updatesViewed: {
        latest: "1000.0.0",
        latestNonBreaking: "1.2.3",
      },
    });
  });

  function mockChangelogCall(releaseNote) {
    cy.intercept("GET", "/api/changelog", {
      statusCode: 200,
      body: {
        currentVersion: "1000.0.0",
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
    });
  }

  it("shows warning if the selected release note has a breaking changes title.", () => {
    mockChangelogCall(
      "### Breaking Changes\n -this changes is breaking your slice machine"
    );
    cy.visit("/changelog");
    cy.waitUntil(() => cy.contains("All versions"));
    cy.get("[data-testid=breaking-changes-warning]").should("exist");
  });

  it("should not display the warning if the selected release note does not have a breaking changes title.", () => {
    mockChangelogCall("This release does not include Breaking Changes");
    cy.visit("/changelog");
    cy.waitUntil(() => cy.contains("All versions"));
    cy.get("[data-testid=breaking-changes-warning]").should("not.exist");
  });
});
