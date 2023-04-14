import { BaseEditWidgetModal } from "./baseEditWidgetModal";

class ImageModal extends BaseEditWidgetModal {
  editName(newName) {
    cy.getInputByLabel("Name").clear().type(newName);

    return this;
  }

  editWidth(newWidth) {
    cy.getInputByLabel("Width (px)").clear().type(newWidth);

    return this;
  }

  editHeight(newHeight) {
    cy.getInputByLabel("Height (px)").clear().type(newHeight);

    return this;
  }

  addThumbnail(name, height, width) {
    cy.get("[aria-label='Add a thumbnail']").click();
    this.editName(name);
    this.editHeight(height);
    this.editWidth(width);

    return this;
  }
}

export const imageModal = new ImageModal();
