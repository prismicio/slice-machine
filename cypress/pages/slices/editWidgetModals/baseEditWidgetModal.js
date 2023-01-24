export class BaseEditWidgetModal {
  constructor() {
    this.root = "[aria-modal]";
  }

  get closeIcon() {
    return cy.get(`${this.root} [aria-label="Close"]`);
  }

  get saveIcon() {
    return cy.get(`${this.root} [type="submit"]`).contains("Save");
  }

  close() {
    this.closeIcon.click();
    cy.get(this.root).should("not.exist");
    return this;
  }

  save() {
    this.saveIcon.click();
    cy.get(this.root).should("not.exist");
    return this;
  }

  editTextField(label, text) {
    cy.getInputByLabel(label).clear().type(text);
    return this;
  }
}
