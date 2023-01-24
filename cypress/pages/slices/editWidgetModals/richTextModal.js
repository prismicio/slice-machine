import { BaseEditWidgetModal } from "./baseEditWidgetModal";

export class RichTextModal extends BaseEditWidgetModal {
  editLabel(newLabel) {
    this.editTextField("Label", newLabel);
    return this;
  }

  editApiId(newId) {
    this.editTextField("API ID*", newId);
    return this;
  }

  editPlaceholder(newPlaceholder) {
    this.editTextField("Placeholder", newPlaceholder);
    return this;
  }

  toggleAllowTargetBlank() {
    cy.get(this.root).contains("Allow target blank for links").click();
    return this;
  }

  toggleAllowMultipleParagraphs() {
    cy.get(this.root).contains("Allow multiple paragraphs").click();
    return this;
  }

  deselectAllTextTypes() {
    cy.get(this.root).contains("button", "Unselect All").click();
    return this;
  }

  toggleTextTypes(types) {
    types.forEach((type) => {
      cy.get(this.root).get(`[aria-label="${type}"]`).click();
    });

    return this;
  }
}
