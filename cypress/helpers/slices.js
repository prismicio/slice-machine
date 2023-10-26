import "cypress-wait-until";
import { TYPES_FILE, SLICE_MODEL } from "../consts";
import { slicesList } from "../pages/slices/slicesList";
import { createSliceModal } from "../pages/slices/createSliceModal";
import { sliceBuilder } from "../pages/slices/sliceBuilder";
import { sliceRenameModal } from "../pages/RenameModal";
import { addFieldModal } from "../pages/AddFieldModal";
import { addVariationModal } from "../pages/slices/addVariationModal";

/**
 * Create a Slice and assert files are created.
 *
 * @param {string} lib Slice library where hte custom ype should be created.
 * @param {string} id Id of the custom type.
 * @param {string} name Name of the custom type.
 */
export function createSlice(lib, id, name) {
  slicesList.goTo();
  slicesList.emptyStateButton.click();

  createSliceModal.root.should("be.visible");
  createSliceModal.nameInput.type(name);
  createSliceModal.submit();

  cy.location("pathname", { timeout: 20000 }).should(
    "eq",
    `/slices/${lib}/${name}/default`,
  );
  cy.readFile(TYPES_FILE).should("contains", name);
}

/**
 * Rename a Slice and assert files are modified.
 *
 * @param {string} actualName Current name of the slice.
 * @param {string} newName New name to use for the slice.
 */
export function renameSlice(actualName, newName) {
  slicesList.goTo();
  cy.waitUntil(() => cy.get("[data-cy=slice-action-icon]"));

  slicesList.getOptionDopDownButton(actualName).click();

  slicesList.optionDopDownMenu.should("be.visible");
  slicesList.renameButton.click();

  sliceRenameModal.root.should("be.visible");
  sliceRenameModal.input.should("have.value", actualName);
  sliceRenameModal.input.clear().type(newName);
  sliceRenameModal.submit();

  cy.contains(newName).should("exist");

  cy.readFile(SLICE_MODEL(newName)).then((model) => {
    expect(JSON.stringify(model)).to.contain(newName);
  });
}

/**
 * On the Slice builder, add static field to the Slice.
 *
 * @param {string} fieldType Type of field to create.
 * @param {string} fieldName Label of the new field.
 * @param {string} fieldId Id of the new field.
 */
export function addStaticFieldToSlice(fieldType, fieldName, fieldId) {
  const elements = {
    addFieldButton: sliceBuilder.addStaticFieldButton,
    fieldArea: sliceBuilder.staticZone,
    fieldPreId: "slice.primary",
  };

  return addFieldToSlice(elements, fieldType, fieldName, fieldId);
}

/**
 * On the Slice builder, add a repeatable field to the Slice.
 *
 * @param {string} fieldType Type of field to create.
 * @param {string} fieldName Label of the new field.
 * @param {string} fieldId Id of the new field.
 */
export function addRepeatableFieldToSlice(fieldType, fieldName, fieldId) {
  const elements = {
    addFieldButton: sliceBuilder.addRepeatableFieldButton,
    fieldArea: sliceBuilder.repeatableZone,
    fieldPreId: "slice.items[i]",
  };

  return addFieldToSlice(elements, fieldType, fieldName, fieldId);
}

function addFieldToSlice(elements, fieldType, fieldName, fieldId) {
  elements.addFieldButton.first().click();
  addFieldModal.pickField(fieldType);

  sliceBuilder.NewField.inputName().clear();
  // waiting for the field to re-render
  cy.wait(500);
  sliceBuilder.NewField.inputName().type(fieldName);

  // API Id modification for UID field is disabled
  if (fieldType != "UID") {
    sliceBuilder.NewField.inputId().clear();
    // waiting for the field to re-render
    cy.wait(500);
    sliceBuilder.NewField.inputId().type(fieldId);
  }

  sliceBuilder.NewField.submit();

  elements.fieldArea.within(() => {
    cy.contains(fieldName).should("be.visible");
    cy.contains(`${elements.fieldPreId}.${fieldId}`).should("be.visible");
  });
}

/**
 * On the Slice builder, add a new variation through the variation modal.
 *
 * @param {string} variationName Name of the variation.
 */
export function addVariationToSlice(variationName) {
  sliceBuilder.addVariationButton.click();

  addVariationModal.root.within(() => {
    addVariationModal.nameInput.type(variationName);
    addVariationModal.submit();
  });
  addVariationModal.root.should("not.exist");
}
