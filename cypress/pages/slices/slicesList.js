import { deleteModal } from "../DeleteModal";

class SlicesList {
  get emptyStateButton() {
    return cy.get("[data-testid=empty-state-main-button]");
  }

  getOptionDopDownButton(sliceName) {
    return this.getSliceCard(sliceName).get(`[data-testid=slice-action-icon]`);
  }

  getSliceCard(sliceName) {
    return cy.get(`[aria-label^="${sliceName}"][aria-label$="slice card"]`);
  }

  get optionDopDownMenu() {
    return cy.get('[data-testid="slice-action-icon-dropdown"]');
  }

  get deleteButton() {
    return this.optionDopDownMenu.contains("Delete");
  }

  get renameButton() {
    return this.optionDopDownMenu.contains("Rename");
  }

  goTo() {
    cy.visit(`/slices`);
    return this;
  }

  /**
   * On the Slice list, delete a slice.
   *
   * @param {string} sliceName name of the slice to delete.
   */
  deleteSlice(sliceName) {
    this.getOptionDopDownButton(sliceName).click();
    this.optionDopDownMenu.should("be.visible");

    this.deleteButton.click();

    deleteModal.root.should("be.visible");
    deleteModal.submit();

    this.getSliceCard(sliceName).should("not.exist");
  }
}

export const slicesList = new SlicesList();
