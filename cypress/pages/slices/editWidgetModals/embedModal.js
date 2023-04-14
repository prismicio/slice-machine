import { BaseEditWidgetModal } from "./baseEditWidgetModal";

class EmbedModal extends BaseEditWidgetModal {
	editPlaceholder(newPlaceholder) {
		this.editTextField("Placeholder", newPlaceholder);

		return this;
	}
}

export const embedModal = new EmbedModal();
