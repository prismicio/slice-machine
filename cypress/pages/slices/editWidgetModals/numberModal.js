import { BaseEditWidgetModal } from "./baseEditWidgetModal";

class NumberModal extends BaseEditWidgetModal {
	editPlaceholder(newPlaceholder) {
		this.editTextField("Placeholder", newPlaceholder);

		return this;
	}
}

export const numberModal = new NumberModal();
