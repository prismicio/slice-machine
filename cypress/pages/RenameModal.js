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

  submit() {
    this.root.submit();
    return this;
  }
}

export class CustomTypeRenameModal extends RenameModal {
  constructor() {
    super(
      "[data-cy=rename-custom-type-modal]",
      '[data-cy="custom-type-name-input"]'
    );
  }
}

export class SliceRenameModal extends RenameModal {
  constructor() {
    super("[data-cy=rename-slice-modal]", '[data-cy="slice-name-input"]');
  }
}
