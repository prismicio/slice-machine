import { BaseEditWidgetModal } from "./baseEditWidgetModal";

class LinkModal extends BaseEditWidgetModal {
  editPlaceholder(newPlaceholder) {
    this.editTextField("Placeholder", newPlaceholder);

    return this;
  }

  toggleAllowTargetBlank() {
    cy.get(this.root).contains("Allow target blank").click();

    return this;
  }
}

export const linkModal = new LinkModal();
