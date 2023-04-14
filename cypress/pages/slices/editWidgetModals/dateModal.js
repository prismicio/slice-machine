import { BaseEditWidgetModal } from "./baseEditWidgetModal";

class DateModal extends BaseEditWidgetModal {
  editPlaceholder(newPlaceholder) {
    this.editTextField("Placeholder", newPlaceholder);

    return this;
  }
}

export const dateModal = new DateModal();
