import { Builder } from "../Builder";

export class CustomTypeBuilder extends Builder {
  get renameButton() {
    return cy.get('[data-cy="edit-custom-type"]');
  }

  get updateSliceZoneButton() {
    return cy.get("[data-cy=update-slices]");
  }

  get headerCustomTypeName() {
    return cy.get('[data-cy="custom-type-secondary-breadcrumb"]');
  }

  get staticZone() {
    return cy.get("[data-cy=ct-static-zone]");
  }

  goTo(ctId) {
    cy.visit(`/cts/${ctId}`);
    this.saveButton.should("be.visible");
    return this;
  }
}
