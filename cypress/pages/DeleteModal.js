class DeleteModal {
  constructor() {
    this.rootSelector = "[aria-modal]";
  }

  get root() {
    return cy.get(this.rootSelector);
  }

  submit() {
    return this.root.contains("button", "Delete").click();
  }
}

export const deleteModal = new DeleteModal();
