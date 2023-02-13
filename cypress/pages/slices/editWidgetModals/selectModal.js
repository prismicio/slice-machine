import { BaseEditWidgetModal } from "./baseEditWidgetModal";

export class SelectModal extends BaseEditWidgetModal {
  editPlaceholder(newPlaceholder) {
    this.editTextField("Placeholder", newPlaceholder);
    return this;
  }

  toggleFirstValAsDefault() {
    cy.get(this.root).contains("use first value as default").click();
    return this;
  }

  changeOptionLabel(optionNumber, newLabel) {
    cy.get(this.root)
      .get(`[name='config.options.${optionNumber - 1}']`)
      .clear()
      .type(newLabel);
    return this;
  }

  addOption(label) {
    cy.get(this.root).contains("button", "Add option").click();
    cy.get(this.root).get("input").last().type(label);
    return this;
  }
}
