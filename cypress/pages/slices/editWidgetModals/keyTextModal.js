import { BaseEditWidgetModal } from "./baseEditWidgetModal";

class KeyTextModal extends BaseEditWidgetModal {
  editPlaceholder(newPlaceholder) {
    this.editTextField("Placeholder", newPlaceholder);

    return this;
  }
}

export const keyTextModal = new KeyTextModal();
