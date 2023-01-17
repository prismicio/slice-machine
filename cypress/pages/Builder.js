export class Builder {
  get saveButton() {
    return cy.contains("Save to File System");
  }

  get addStaticFieldButton() {
    return cy.get(`[data-cy="add-Static-field"]`);
  }

  get NewField() {
    return {
      inputName: () => cy.get("[data-cy=new-field-name-input]"),
      inputId: () => cy.get("[data-cy=new-field-id-input]"),
      submit: () => cy.get("[data-cy=new-field-form]").submit(),
    };
  }

  save() {
    this.saveButton.should("not.be.disabled");
    this.saveButton.click();
    cy.contains("Models & mocks have been generated successfully").should(
      "be.visible"
    );
    cy.get("[data-cy=builder-save-button-spinner]").should("be.visible");
    cy.get("[data-cy=builder-save-button-icon]").should("be.visible");
    this.saveButton.should("be.disabled");
    return this;
  }
}
