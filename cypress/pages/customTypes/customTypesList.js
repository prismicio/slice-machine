class CustomTypesList {
  get emptyStateButton() {
    return cy.get("[data-cy=create-ct]");
  }

  getOptionDopDownButton(id) {
    return this.getCustomTypeRow(id).get('[data-testid="tableRowSettings"]');
  }

  get optionDopDownMenu() {
    return cy.get('[role="menu"][data-state="open"]');
  }

  get deleteButton() {
    return this.optionDopDownMenu.contains("Delete");
  }

  get renameButton() {
    return this.optionDopDownMenu.contains("Rename");
  }

  getCustomTypeRow(id) {
    return cy.contains("tr", id);
  }

  getCustomTypeLabel(id) {
    return cy.get(`[data-cy="custom-type-${id}-label"]`);
  }

  goTo() {
    cy.visit("/custom-types");
    return this;
  }
}

export const customTypesList = new CustomTypesList();
