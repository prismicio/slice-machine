export class Changes {
  get pushButton() {
    return cy.get("[data-cy=push-changes]");
  }
  
  goTo() {
    cy.visit(`/changes`);
    return this;
  }
}