import { BaseEditWidgetModal } from "./baseEditWidgetModal";

export class ColorModal extends BaseEditWidgetModal {
  editPlaceholder(newPlaceholder) {
    this.editTextField("Placeholder", newPlaceholder);
    return this;
  }
}
