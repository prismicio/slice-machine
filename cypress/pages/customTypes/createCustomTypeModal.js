export class CreateCustomTypeModal {
  get root() {
    return cy.get("[data-cy=create-ct-modal]");
  }

  get nameInput() {
    return cy.get("input[data-cy=ct-name-input]");
  }

  get idInput() {
    return cy.get("input[data-cy=ct-id-input]");
  }

  submit() {
    this.root.submit();
    return this;
  }
}
