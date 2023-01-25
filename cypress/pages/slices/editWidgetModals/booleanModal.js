import { BaseEditWidgetModal } from "./baseEditWidgetModal";

export class BooleanModal extends BaseEditWidgetModal {
  editLabel(newLabel) {
    this.editTextField("Label", newLabel);
    return this;
  }

  editApiId(newId) {
    this.editTextField("API ID*", newId);
    return this;
  }

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
