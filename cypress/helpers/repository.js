/**
 * Push Changes to the Repository, assert the number of changes as well.
 *
 * @param {number} numberOfChanges number of changes that should be pushed, this number is used for assertions
 */
export function pushLocalChanges(numberOfChanges = 1) {
  cy.visit(`/changes`);

  // checking number of changes
  cy.get("[data-cy=changes-number]").within(() => {
    cy.contains(numberOfChanges).should("be.visible");
  });

  // sync changes button should be enabled
  cy.get("[data-cy=push-changes]").should("be.enabled");

  // click to push changes
  cy.get("[data-cy=push-changes]").click();

  // number of changes should now be 0 at the end of the push
  // The time to wait depends on the number of changes
  cy.get("[data-cy=changes-number]", {
    timeout: 5000 * (numberOfChanges + 1),
  }).should("not.exist");

  // sync changes button should be disabled
  cy.get("[data-cy=push-changes]").should("be.disabled");
}
