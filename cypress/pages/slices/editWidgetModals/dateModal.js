import { BaseEditWidgetModal } from "./baseEditWidgetModal";

export class DateModal extends BaseEditWidgetModal {
  editPlaceholder(newPlaceholder) {
    this.editTextField("Placeholder", newPlaceholder);
    return this;
  }
}
