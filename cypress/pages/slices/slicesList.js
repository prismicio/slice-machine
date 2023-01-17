export class SlicesList {
  get emptyStateButton() {
    return cy.get('[data-cy=empty-state-main-button]');
  }
  
  goTo() {
    cy.visit(`/slices`);
    return this;
  }
}