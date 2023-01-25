import { BaseEditWidgetModal } from "./baseEditWidgetModal";

export class KeyTextModal extends BaseEditWidgetModal {
  editPlaceholder(newPlaceholder) {
    this.editTextField("Placeholder", newPlaceholder);
    return this;
  }
}
