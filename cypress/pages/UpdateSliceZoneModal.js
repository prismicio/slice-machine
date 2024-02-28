class UpdateSliceZoneModal {
  get root() {
    return cy.get("[data-testid=update-slices-modal]");
  }

  selectSlice(sliceId) {
    cy.get(`[data-testid=shared-slice-card-${sliceId}]`).click();
    return this;
  }

  submit() {
    this.root.submit();
    return this;
  }
}

export const updateSliceZoneModal = new UpdateSliceZoneModal();
