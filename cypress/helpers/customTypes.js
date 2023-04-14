import "cypress-wait-until";
import { TYPES_FILE, CUSTOM_TYPE_MODEL } from "../consts";
import { customTypeBuilder } from "../pages/customTypes/customTypeBuilder";
import { customTypeRenameModal } from "../pages/RenameModal";
import { updateSliceZoneModal } from "../pages/UpdateSliceZoneModal";
import { customTypesList } from "../pages/customTypes/customTypesList";
import { createCustomTypeModal } from "../pages/customTypes/createCustomTypeModal";
import { deleteModal } from "../pages/DeleteModal";
import { addFieldModal } from "../pages/AddFieldModal";

/**
 * Create a Custom type and assert files are created.
 *
 * @param {string} id Id of the custom type.
 * @param {string} name Name of the custom type.
 */
export function createCustomType(id, name) {
	customTypesList.goTo();
	customTypesList.emptyStateButton.click();

	createCustomTypeModal.root.should("be.visible");
	createCustomTypeModal.nameInput.type(name);
	createCustomTypeModal.idInput.should("have.value", id);
	createCustomTypeModal.submit();

	cy.location("pathname", { timeout: 15000 }).should("eq", `/cts/${id}`);
	cy.readFile(TYPES_FILE).should("contains", name);
	cy.readFile(CUSTOM_TYPE_MODEL(id));
}

/**
 * On the Custom Type builder, rename the custom type.
 *
 * @param {string} id Id of the custom type.
 * @param {string} actualName Current name of the custom type.
 * @param {string} newName New name for the custom type.
 */
export function renameCustomType(id, actualName, newName) {
	customTypesList.goTo();

	customTypesList.getOptionDopDownButton(id).click();
	customTypesList.optionDopDownMenu.should("be.visible");

	customTypesList.renameButton.click();

	customTypeRenameModal.root.should("be.visible");
	customTypeRenameModal.input.should("have.value", actualName);
	customTypeRenameModal.input.clear().type(`${newName} - Edited`);
	customTypeRenameModal.submit();
	customTypeRenameModal.root.should("not.exist");

	customTypesList.getCustomTypeLabel(id).contains("Edited");

	cy.readFile(TYPES_FILE).should("contains", `${newName} - Edited`);
	cy.readFile(CUSTOM_TYPE_MODEL(id)).then((model) => {
		expect(JSON.stringify(model)).to.contain(newName);
	});
}

/**
 * On the Custom Type builder, delete a custom type.
 *
 * @param {string} id Id of the custom type.
 */
export function deleteCustomType(id) {
	customTypesList.goTo();

	customTypesList.getOptionDopDownButton(id).click();
	customTypesList.optionDopDownMenu.should("be.visible");

	customTypesList.deleteButton.click();

	deleteModal.root.should("be.visible");
	deleteModal.submit();

	customTypesList.getCustomTypeLabel(id).should("not.exist");
}

/**
 * On the Custom Type builder, add static field to the custom type.
 *
 * @param {string} fieldType Type of field to create.
 * @param {string} fieldName Label of the new field.
 * @param {string} fieldId Id of the new field.
 */
export function addFieldToCustomType(fieldType, fieldName, fieldId) {
	customTypeBuilder.addStaticFieldButton.first().click();
	addFieldModal.pickField(fieldType);

	customTypeBuilder.NewField.inputName().clear();
	// waiting for the field to re-render
	cy.wait(500);
	customTypeBuilder.NewField.inputName().type(fieldName);

	// API Id modification for UID field is disabled
	if (fieldType != "UID") {
		customTypeBuilder.NewField.inputId().clear();
		// waiting for the field to re-render
		cy.wait(500);
		customTypeBuilder.NewField.inputId().type(fieldId);
	}

	customTypeBuilder.NewField.submit();
	customTypeBuilder.staticZone.within(() => {
		cy.contains(fieldName).should("be.visible");
		cy.contains(`data.${fieldId}`).should("be.visible");
	});
}

/**
 * On the Custom Type builder, add slices to the custom type.
 *
 * @param {string[]} sliceIds Ids of slices to add to the custom type.
 */
export function addSlicesToCustomType(sliceIds) {
	customTypeBuilder.updateSliceZoneButton.click();
	sliceIds.forEach((sliceId) => updateSliceZoneModal.selectSlice(sliceId));
	updateSliceZoneModal.submit();
}
