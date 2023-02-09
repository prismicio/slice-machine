/**
 * Push Changes to the Repository, assert the number of changes as well.
 *
 * @param {number} numberOfChanges number of changes that should be pushed, this number is used for assertions. If this is undefined, no assertions will be made on the number of changes left after the push
 */
export function pushLocalChanges(numberOfChanges) {
  cy.visit(`/changes`);

  if (numberOfChanges) {
    // checking number of changes
    cy.get("[data-cy=changes-number]").within(() => {
      cy.contains(numberOfChanges).should("be.visible");
    });
  }

  // sync changes button should be enabled
  cy.get("[data-cy=push-changes]").should("be.enabled");

  // click to push changes
  cy.get("[data-cy=push-changes]").click();

  if (numberOfChanges) {
    // number of changes should now be 0 at the end of the push
    // The time to wait depends on the number of changes
    cy.get("[data-cy=changes-number]", {
      timeout: 10000,
    }).should("not.exist");

    // sync changes button should be disabled
    cy.get("[data-cy=push-changes]").should("be.disabled");

    cy.contains("Up to date").should("be.visible");
  }
}
