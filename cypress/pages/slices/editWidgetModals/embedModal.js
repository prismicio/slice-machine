import { BaseEditWidgetModal } from "./baseEditWidgetModal";

export class EmbedModal extends BaseEditWidgetModal {
  editPlaceholder(newPlaceholder) {
    this.editTextField("Placeholder", newPlaceholder);
    return this;
  }
}
