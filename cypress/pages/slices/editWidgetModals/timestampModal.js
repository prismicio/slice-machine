import { BaseEditWidgetModal } from "./baseEditWidgetModal";

export class TimestampModal extends BaseEditWidgetModal {
  editPlaceholder(newPlaceholder) {
    this.editTextField("Placeholder", newPlaceholder);
    return this;
  }
}
