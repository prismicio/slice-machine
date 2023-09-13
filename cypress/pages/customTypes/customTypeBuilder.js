import { BaseBuilder } from "../BaseBuilder";

class CustomTypeBuilder extends BaseBuilder {
  get renameButton() {
    return cy.get('[data-cy="edit-custom-type"]');
  }

  get updateSliceZoneButton() {
    return cy.getByText("Add from libraries");
  }

  get headerCustomTypeName() {
    return cy.get('[data-cy="custom-type-secondary-breadcrumb"]');
  }

  get staticZone() {
    return cy.get("[data-cy=ct-static-zone]");
  }

  get successToast() {
    return cy.contains("Model has been generated successfully!");
  }

  addTab(tabId) {
    cy.contains("Add Tab").click();
    cy.getInputByLabel("New Tab ID").type(tabId);
    cy.get("#create-tab").contains("Save").click();
    return this;
  }

  async addSliceToSliceZone(sliceId) {
    await cy.findAllByText(/Add/)[0].click();
    this.updateSliceZoneButton.click();
    cy.get(`[data-cy=check-${sliceId}]`).click({ force: true });
    cy.get("[data-cy=update-slices-modal]").submit();
    return this;
  }

  goTo(ctId) {
    cy.visit(`/custom-types/${ctId}`);
    this.saveButton.should("be.visible");
    return this;
  }

  save() {
    super.save();
    this.successToast.should("be.visible");
    return this;
  }
}

export const customTypeBuilder = new CustomTypeBuilder();
