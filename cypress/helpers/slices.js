import "cypress-wait-until";
import { TYPES_FILE, SLICE_MODEL } from "../consts";

/**
 * Create a Slice and assert files are created.
 *
 * @param {string} lib Slice library where hte custom ype should be created.
 * @param {string} id Id of the custom type.
 * @param {string} name Name of the custom type.
 */
export function createSlice(lib, id, name) {
  cy.visit(`/slices`);

  // create slice
  cy.get("[data-cy=empty-state-main-button]").click();
  cy.get("[data-cy=create-slice-modal]").should("be.visible");

  cy.get("input[data-cy=slice-name-input]").type(name);
  cy.get("[data-cy=create-slice-modal]").submit();
  cy.location("pathname", { timeout: 20000 }).should(
    "eq",
    `/${lib}/${name}/default`
  );
  cy.readFile(TYPES_FILE).should("contains", name);
}

/**
 * Rename a Slice and assert files are modified.
 *
 * @param {string} lib Slice library where the slice should be created.
 * @param {string} actualName Current name of the slice.
 * @param {string} newName New name to use for the slice.
 */
export function renameSlice(lib, actualName, newName) {
  cy.visit(`/${lib}/${actualName}/default`);

  // edit slice name
  cy.get('[data-cy="edit-slice-name"]').click();
  cy.get("[data-cy=rename-slice-modal]").should("be.visible");
  cy.get('[data-cy="slice-name-input"]').should("have.value", actualName);
  cy.get('[data-cy="slice-name-input"]').clear().type(`${newName}`);
  cy.get("[data-cy=rename-slice-modal]").submit();
  cy.location("pathname", { timeout: 20000 }).should(
    "eq",
    `/${lib}/${newName}/default`
  );
  cy.get('[data-cy="slice-and-variation-name-header"]').contains(
    `/ ${newName} / Default`
  );
  cy.get("[data-cy=rename-slice-modal]").should("not.exist");
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
  const selectors = {
    addField: "add-Static-field",
    fieldArea: "slice-non-repeatable-zone",
    fieldPreId: "slice.primary",
  };

  return addFieldToSlice(selectors, fieldType, fieldName, fieldId);
}

/**
 * On the Slice builder, add a repeatable field to the Slice.
 *
 * @param {string} fieldType Type of field to create.
 * @param {string} fieldName Label of the new field.
 * @param {string} fieldId Id of the new field.
 */
export function addRepeatableFieldToSlice(fieldType, fieldName, fieldId) {
  const selectors = {
    addField: "add-Repeatable-field",
    fieldArea: "slice-repeatable-zone",
    fieldPreId: "slice.items[i]",
  };

  return addFieldToSlice(selectors, fieldType, fieldName, fieldId);
}

function addFieldToSlice(selectors, fieldType, fieldName, fieldId) {
  cy.get(`[data-cy="${selectors.addField}"]`).first().click();
  cy.get(`[data-cy='${fieldType}']`).click();

  cy.get("[data-cy=new-field-name-input]").clear();
  // waiting for the field to re-render
  cy.wait(500);
  cy.get("[data-cy=new-field-name-input]").type(fieldName);

  // API Id modification for UID field is disabled
  if (fieldType != "UID") {
    cy.get("[data-cy=new-field-id-input]").clear();
    // waiting for the field to re-render
    cy.wait(500);
    cy.get("[data-cy=new-field-id-input]").type(fieldId);
  }

  cy.get("[data-cy=new-field-form]").submit();

  cy.get(`[data-cy=${selectors.fieldArea}]`).within(() => {
    cy.contains(fieldName).should("be.visible");
    cy.contains(`${selectors.fieldPreId}.${fieldId}`).should("be.visible");
  });
}

/**
 * On the Slice builder, save all changes.
 */
export function saveSliceModifications() {
  cy.get("[data-cy=builder-save-button]").should("not.be.disabled");
  cy.get("[data-cy=builder-save-button]").click();
  cy.get("[data-cy=builder-save-button-spinner]").should("be.visible");
  cy.get("[data-cy=builder-save-button-icon]").should("be.visible");
}
