import { BaseEditWidgetModal } from "./baseEditWidgetModal";

export class BooleanModal extends BaseEditWidgetModal {
  editFalsePlaceholder(newPlaceholder) {
    this.editTextField("False Placeholder", newPlaceholder);
    return this;
  }

  editTruePlaceholder(newPlaceholder) {
    this.editTextField("True Placeholder", newPlaceholder);
    return this;
  }

  toggleDefaultTrue() {
    cy.get(this.root).contains("Default to true").click();
    return this;
  }
}
