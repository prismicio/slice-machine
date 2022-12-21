import "cypress-wait-until";
import { TYPES_FILE, CUSTOM_TYPE_MODEL } from "../consts";

export function createCustomType(id, name) {
  cy.visit("/");
  cy.waitUntil(() => cy.get("[data-cy=empty-state-main-button]"));

  // create custom type
  cy.get("[data-cy=empty-state-main-button]").click();
  cy.get("[data-cy=create-ct-modal]").should("be.visible");

  cy.get("input[data-cy=ct-name-input]").type(name);
  cy.get("[data-cy=create-ct-modal]").submit();
  cy.location("pathname", { timeout: 15000 }).should("eq", `/cts/${id}`);
  cy.readFile(TYPES_FILE).should("contains", name);
  cy.readFile(CUSTOM_TYPE_MODEL(id));
}

export function renameCustomType(id, actualName, newName) {
  cy.visit(`/cts/${id}`);
  cy.waitUntil(() => cy.get('[data-cy="edit-custom-type"]'));

  // rename the custom type
  cy.get('[data-cy="edit-custom-type"]').click();
  cy.get("[data-cy=rename-custom-type-modal]").should("be.visible");
  cy.get('[data-cy="custom-type-name-input"]').should("have.value", actualName);
  cy.get('[data-cy="custom-type-name-input"]')
    .clear()
    .type(`${newName} - Edited`);
  cy.get("[data-cy=rename-custom-type-modal]").submit();
  cy.get("[data-cy=rename-custom-type-modal]").should("not.exist");
  cy.get('[data-cy="custom-type-secondary-breadcrumb"]').contains(
    `/ ${newName} - Edited`
  );
  cy.readFile(TYPES_FILE).should("contains", `${newName} - Edited`);
  cy.readFile(CUSTOM_TYPE_MODEL(id)).should("contains", newName);
}

export function addFieldToCustomType(
  fieldType,
  fieldName,
  fieldId,
  isFirstField /* boolean | undefined */
) {
  const addFieldButtonSelector = isFirstField
    ? "empty-Static-add-field"
    : "add-Static-field";

  cy.get(`[data-cy="${addFieldButtonSelector}"]`).first().click();
  cy.get(`[data-cy='${fieldType}']`).click();
  cy.get("[data-cy=new-field-name-input]").clear().type(fieldName);

  // API Id modification for UID field is disabled
  if (fieldType != "UID")
    cy.get("[data-cy=new-field-id-input]").clear().type(fieldId);

  cy.get("[data-cy=new-field-form]").submit();
  cy.get("[data-cy=ct-static-zone]").within(() => {
    cy.contains(fieldName).should("be.visible");
    cy.contains(`data.${fieldId}`).should("be.visible");
  });
}
