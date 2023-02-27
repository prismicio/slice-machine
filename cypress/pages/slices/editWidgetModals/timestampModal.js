import { BaseEditWidgetModal } from "./baseEditWidgetModal";

class TimestampModal extends BaseEditWidgetModal {
  editPlaceholder(newPlaceholder) {
    this.editTextField("Placeholder", newPlaceholder);
    return this;
  }
}

export const timestampModal = new TimestampModal();
