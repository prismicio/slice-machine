import { BaseEditWidgetModal } from "./baseEditWidgetModal";

export class LinkModal extends BaseEditWidgetModal {
  editPlaceholder(newPlaceholder) {
    this.editTextField("Placeholder", newPlaceholder);
    return this;
  }

  toggleAllowTargetBlank() {
    cy.get(this.root).contains("Allow target blank").click();
    return this;
  }
}
