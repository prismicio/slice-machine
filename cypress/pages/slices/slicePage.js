export class SlicePage {
  get saveButton() {
    return cy.contains("Save to File System");
  }
  get imagePreview() {
    return cy.get("[alt='Preview image']");
  }

  goTo(sliceName) {
    cy.visit(`/slices/${sliceName}/default`);
    this.saveButton.should("be.visible");
    cy.contains(sliceName).should("be.visible");
    return this;
  }

  openScreenshotModal() {
    cy.contains("Update screenshot").click();
    return this;
  }

  openVariationModal() {
    cy.get("[aria-label='Expand variations']").parent().click();
    cy.contains("Add new variation").click();
    return this;
  }

  save() {
    this.saveButton.click();
    this.saveButton.should("be.disabled");
    cy.contains("Models & mocks have been generated successfully").should(
      "be.visible"
    );
    return this;
  }
}
