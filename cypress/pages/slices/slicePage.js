export class SlicePage {
  get saveButton() {
    return cy.contains("Save to File System");
  }
  get imagePreview() {
    return cy.get("[alt='Preview image']");
  }

  get imagePreviewSrc() {
    this.imagePreview.then(($img) => {
      return $img.attr("src");
    });
  }

  goTo(sliceLibrary, sliceName) {
    cy.visit(`/${sliceLibrary}/${sliceName}/default`);
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

  changeToVariation(startVariation, targetVariation) {
    cy.get("button").contains(startVariation).click();
    cy.contains(targetVariation).click();
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

  openSimulator() {
    cy.contains("Simulate Slice").click();
    cy.wait(5000); // wait for ready state
    return this;
  }
}
