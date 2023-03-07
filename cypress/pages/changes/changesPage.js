import { menu } from "../menu";

class ChangesPage {
  get pushButton() {
    return cy.get("[data-cy=push-changes]");
  }

  get screenshotsButton() {
    return cy.get("button").contains("Update all screenshots");
  }

  goTo() {
    cy.visit(`/changes`);
    this.pushButton.should("be.visible");
    return this;
  }

  /**
   * Push Changes to the Repository, assert the number of changes as well.
   *
   * @param {number} numberOfChanges number of changes that should be pushed, this number is used for assertions. If this is undefined, no assertions will be made on the number of changes left after the push
   */
  pushChanges(numberOfChanges) {
    if (numberOfChanges !== undefined) {
      // checking number of changes
      menu.changesNumber().contains(numberOfChanges).should("be.visible");
    }

    // sync changes button should be enabled
    this.pushButton.should("be.enabled");

    // click to push changes
    this.pushButton.click();
    if (numberOfChanges !== undefined) {
      // number of changes should now be 0 at the end of the push
      // The time to wait depends on the number of changes
      menu
        .changesNumber({
          timeout: 5000 * (numberOfChanges + 1),
        })
        .should("not.exist");

      // sync changes button should be disabled
      this.pushButton.should("be.disabled");
    }

    return this;
  }

  isUpToDate() {
    cy.contains("Up to date").should("be.visible");
    this.pushButton.should("be.disabled");

    return this;
  }

  mockPushError(statusCode) {
    cy.intercept("POST", "/api/push-changes", {
      statusCode: statusCode,
      body: null,
    });

    return this;
  }

  mockPushLimit(limitType, customTypesInPush) {
    cy.intercept("POST", "/api/push-changes", {
      statusCode: 200,
      body: {
        type: limitType,
        details: {
          customTypes: customTypesInPush,
        },
      },
    });
  }

  unMockPushRequest() {
    cy.intercept("POST", "/api/push-changes", (req) => {
      req.continue();
    });
  }
}

export const changesPage = new ChangesPage();
