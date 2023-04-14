import { BaseEditWidgetModal } from "./baseEditWidgetModal";

class ContentRelationshipModal extends BaseEditWidgetModal {
  addCustomType(ctName) {
    cy.get(this.root).get("[role='combobox']").type(ctName);
    cy.get("[id='react-select-3-option-0']").click();

    return this;
  }
}

export const contentRelationshipModal = new ContentRelationshipModal();
