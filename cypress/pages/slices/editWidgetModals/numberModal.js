import { BaseEditWidgetModal } from "./baseEditWidgetModal";

export class NumberModal extends BaseEditWidgetModal {
  editPlaceholder(newPlaceholder) {
    this.editTextField("Placeholder", newPlaceholder);
    return this;
  }
}
