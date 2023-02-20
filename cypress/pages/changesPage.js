export class ChangesPage {
  get pushButton() {
    return cy.get("[data-cy=push-changes]");
  }

  get screenshotsButton() {
    return cy.get("button").contains("Update all screenshots");
  }

  goTo() {
    cy.visit(`/changes`);
    return this;
  }
}
