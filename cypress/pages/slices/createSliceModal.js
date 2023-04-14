class CreateSliceModal {
  get root() {
    return cy.get("[data-cy=create-slice-modal]");
  }

  get nameInput() {
    return cy.get("input[data-cy=slice-name-input]");
  }

  submit() {
    this.root.submit();

    return this;
  }
}

export const createSliceModal = new CreateSliceModal();
