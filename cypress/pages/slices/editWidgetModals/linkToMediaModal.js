import { BaseEditWidgetModal } from "./baseEditWidgetModal";

export class LinkToMediaModal extends BaseEditWidgetModal {
  editPlaceholder(newPlaceholder) {
    this.editTextField("Placeholder", newPlaceholder);
    return this;
  }
}
