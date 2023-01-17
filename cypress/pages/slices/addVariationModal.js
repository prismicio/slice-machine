export class AddVariationModal {
  get root() {
    return cy.get("[aria-modal]");
  }

  get nameInput() {
    return cy.getInputByLabel("Variation name*")
  }

  submit() {
    return cy.contains("button", "Submit").click();
  }
}