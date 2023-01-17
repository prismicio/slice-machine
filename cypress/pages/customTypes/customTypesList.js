export class CustomTypesList {
  get emptyStateButton() {
    return cy.get("[data-cy=empty-state-main-button]");
  }

  goTo() {
    cy.visit("/");
    return this
  }
}
