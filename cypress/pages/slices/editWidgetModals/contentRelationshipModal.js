import { BaseEditWidgetModal } from "./baseEditWidgetModal";

export class ContentRelationshipModal extends BaseEditWidgetModal {
  addCustomType(ctName) {
    cy.get(this.root).get("[role='combobox']").type(ctName);
    cy.get("[id='react-select-3-option-0']").click();
    return this;
  }
}
