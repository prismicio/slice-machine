import { BaseEditWidgetModal } from "./baseEditWidgetModal";

export class LinkToMediaModal extends BaseEditWidgetModal {
  editLabel(newLabel) {
    this.editTextField("Label", newLabel);
    return this;
  }

  editApiId(newId) {
    this.editTextField("API ID*", newId);
    return this;
  }

  editPlaceholder(newPlaceholder) {
    this.editTextField("Placeholder", newPlaceholder);
    return this;
  }
}
