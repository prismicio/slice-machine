class CreateSliceModal {
  get root() {
    return cy.get("[data-cy=create-slice-modal]");
  }

  get nameInput() {
    return cy.get("input[data-cy=slice-name-input]");
  }

  get submitButton() {
    return cy.get("button[type=submit]");
  }

  submit() {
    this.root.submit();
    return this;
  }
}

export const createSliceModal = new CreateSliceModal();
