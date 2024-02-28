export class BaseBuilder {
  get saveButton() {
    return cy.contains("Save");
  }

  get addStaticFieldButton() {
    return cy.get(`[data-testid="add-Static-field"]`);
  }

  get NewField() {
    return {
      inputName: () => cy.get("[data-testid=new-field-name-input]"),
      inputId: () => cy.get("[data-testid=new-field-id-input]"),
      submit: () => cy.get("[data-testid=new-field-form]").submit(),
    };
  }

  save() {
    this.saveButton.should("not.be.disabled");
    this.saveButton.click();
    cy.get("[data-testid=builder-save-button-spinner]").should("be.visible");
    cy.get("[data-testid=builder-save-button-icon]").should("be.visible");
    this.saveButton.should("be.disabled");
    return this;
  }
}
