export class UpdateSliceZoneModal {
  get root() {
    return cy.get("[data-cy=update-slices-modal]");
  }

  selectSlice(sliceId) {
    // forcing this because the input itself is invisible and an svg is displayed
    cy.get(`[data-cy=check-${sliceId}]`).click({ force: true });
    return this;
  }

  submit() {
    this.root.submit();
    return this;
  }
}
