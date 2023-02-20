export class SlicesList {
  get emptyStateButton() {
    return cy.get('[data-cy=empty-state-main-button]');
  }

  getOptionDopDownButton(sliceName) {
    return this.getSliceCard(sliceName).get(`[data-cy=slice-action-icon]`);
  }

  getSliceCard(sliceName) {
    return cy.get(`[aria-label="${sliceName} slice card"]`);
  }

  get optionDopDownMenu() {
    return cy.get('[data-cy="slice-action-icon-dropdown"]');
  }

  get deleteButton() {
    return this.optionDopDownMenu.contains('Delete');
  }

  get renameButton() {
    return this.optionDopDownMenu.contains('Rename');
  }

  goTo() {
    cy.visit(`/slices`);
    return this;
  }
}