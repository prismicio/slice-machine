const fixturePath = "cypress/fixtures/";

class ScreenshotModal {
  constructor() {
    this.root = "[aria-modal]";
  }

  get imagePreview() {
    return cy.get(`${this.root} img`);
  }

  get closeIcon() {
    return cy.get(`${this.root} [aria-label="Close"]`);
  }

  uploadImage(imageFixturePath) {
    cy.get(`${this.root} input[type="file"]`).selectFile(
      `${fixturePath}${imageFixturePath}`,
      { force: true }
    );
    return this;
  }

  dragAndDropImage(imageFixturePath) {
    cy.get(this.root)
      .get("form")
      .selectFile(`${fixturePath}${imageFixturePath}`, { action: "drag-drop" });
    cy.contains("Uploading file").should("be.visible");
    cy.contains("Uploading file").should("not.exist");
    return this;
  }

  selectVariation(variationName) {
    cy.get(this.root).contains(variationName).click();
    return this;
  }

  close() {
    this.closeIcon.click();
    cy.get(this.root).should("not.exist");
    return this;
  }

  verifyImageIs(imageFixturePath) {
    this.imagePreview.isSameImageAs(imageFixturePath);
    return this;
  }

  verifyImageIsEmpty() {
    this.imagePreview.should("not.exist");
    return this;
  }
}

export const screenshotModal = new ScreenshotModal();
