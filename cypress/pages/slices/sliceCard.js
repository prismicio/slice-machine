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
    cy.get(this.root)
      .realHover()
      .then(($root) => {
        if ($root.find(':contains("Update screenshot")').length > 0) {
          cy.wrap($root).contains("Update screenshot").click();
        } else {
          cy.wrap($root).find('[aria-haspopup="menu"]').click();
          cy.contains("Update screenshot").click();
        }
      });
    cy.root().children().realHover(); // Stop hovering the card.
    return this;
  }
}
