export class SliceCard {
  constructor(sliceName, variationName) {
    this.root =
      variationName !== undefined
        ? `[aria-label="${sliceName} ${variationName} slice card"]`
        : `[aria-label^="${sliceName}"][aria-label$="slice card"]`;
  }

  get content() {
    return cy.get(this.root);
  }

  get imagePreview() {
    return cy.get(this.root).find("[alt='Preview image']");
  }

  openScreenshotModal() {
    cy.get(this.root).find('[aria-haspopup="menu"]').click();
    cy.contains("Update screenshot").click();
    return this;
  }
}
