import { BaseEditWidgetModal } from "./baseEditWidgetModal";

class ColorModal extends BaseEditWidgetModal {
  editPlaceholder(newPlaceholder) {
    this.editTextField("Placeholder", newPlaceholder);

    return this;
  }
}

export const colorModal = new ColorModal();
