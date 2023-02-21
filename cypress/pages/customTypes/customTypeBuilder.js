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

  get successToast() {
    return cy.contains("Model & mocks have been generated successfully!");
  }

  addTab(tabId) {
    cy.contains("Add Tab").click();
    cy.getInputByLabel("New Tab ID").type(tabId);
    cy.get("#create-tab").contains("Save").click();
    return this;
  }

  addSliceToSliceZone(sliceId) {
    this.updateSliceZoneButton.click();
    cy.get(`[data-cy=check-${sliceId}]`).click({ force: true });
    cy.get("[data-cy=update-slices-modal]").submit();
    return this;
  }

  goTo(ctId) {
    cy.visit(`/cts/${ctId}`);
    this.saveButton.should("be.visible");
    return this;
  }

  save() {
    super.save();
    this.successToast.should("be.visible");
    return this;
  }
}
