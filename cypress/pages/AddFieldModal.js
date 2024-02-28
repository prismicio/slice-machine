class AddFieldModal {
  fieldTypeButton(fieldType) {
    return cy.get(`[data-testid='${fieldType}']`);
  }

  pickField(fieldType) {
    this.fieldTypeButton(fieldType).click();
    return this;
  }
}

export const addFieldModal = new AddFieldModal();
