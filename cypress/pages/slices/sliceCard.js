export class SliceCard {
  constructor(sliceName) {
    this.root = `[aria-label="${sliceName} slice card"]`;
  }

  get content() {
    return cy.get(this.root);
  }

  get imagePreview() {
    return cy.get(this.root).find("[alt='Preview image']");
  }

  openScreenshotModal() {
    cy.get(this.root).contains("Update screenshot").click();

    return this;
  }
}
