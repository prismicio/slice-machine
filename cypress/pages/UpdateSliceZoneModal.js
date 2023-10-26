class UpdateSliceZoneModal {
  get root() {
    return cy.get("[data-cy=update-slices-modal]");
  }

  selectSlice(sliceId) {
    cy.get(`[data-cy=shared-slice-card-${sliceId}]`).click();
    return this;
  }

  submit() {
    this.root.submit();
    return this;
  }
}

export const updateSliceZoneModal = new UpdateSliceZoneModal();
