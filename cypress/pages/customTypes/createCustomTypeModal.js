class CreateCustomTypeModal {
  get root() {
    return cy.get("[data-testid=create-ct-modal]");
  }

  get nameInput() {
    return cy.get("input[data-testid=ct-name-input]");
  }

  get idInput() {
    return cy.get("input[data-testid=ct-id-input]");
  }

  submit() {
    this.root.submit();
    return this;
  }
}

export const createCustomTypeModal = new CreateCustomTypeModal();
