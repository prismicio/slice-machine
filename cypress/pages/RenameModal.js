class RenameModal {
  constructor(rootSelector, inputSelector) {
    this.rootSelector = rootSelector;
    this.inputSelector = inputSelector;
  }

  get root() {
    return cy.get(this.rootSelector);
  }

  get input() {
    return cy.get(this.inputSelector);
  }

  get submitButton() {
    return cy.get("button[type=submit]");
  }

  submit() {
    this.root.submit();
    return this;
  }
}

class CustomTypeRenameModal extends RenameModal {
  constructor() {
    super(
      "[data-cy=rename-custom-type-modal]",
      '[data-cy="custom-type-name-input"]'
    );
  }
}

export const customTypeRenameModal = new CustomTypeRenameModal();

class SliceRenameModal extends RenameModal {
  constructor() {
    super("[data-cy=rename-slice-modal]", '[data-cy="slice-name-input"]');
  }
}

export const sliceRenameModal = new SliceRenameModal();
