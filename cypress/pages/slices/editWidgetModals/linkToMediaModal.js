import { BaseEditWidgetModal } from "./baseEditWidgetModal";

class LinkToMediaModal extends BaseEditWidgetModal {
  editPlaceholder(newPlaceholder) {
    this.editTextField("Placeholder", newPlaceholder);

    return this;
  }
}

export const linkToMediaModal = new LinkToMediaModal();
