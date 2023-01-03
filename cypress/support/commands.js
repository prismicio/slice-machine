import {
  setSliceMachineUserContext,
  getSliceMachineUserContext,
} from "../helpers/localStorage";
import {
  clearProject,
  clearAssets,
  clearCustomTypes,
  clearSlices,
  removeTypes,
  modifyFile,
} from "../helpers/filesystem";
import {
  createCustomType,
  renameCustomType,
  addFieldToCustomType,
  addSlicesToCustomType,
  saveCustomTypeModifications,
} from "../helpers/customTypes";
import {
  createSlice,
  renameSlice,
  addStaticFieldToSlice,
  addRepeatableFieldToSlice,
  saveSliceModifications,
} from "../helpers/slices";
import { pushLocalChanges } from "../helpers/repository";

/* -- LOCAL STORAGE -- */
Cypress.Commands.add("setSliceMachineUserContext", setSliceMachineUserContext);
Cypress.Commands.add("getSliceMachineUserContext", getSliceMachineUserContext);

/* -- PROJECT RESET -- */
Cypress.Commands.add("clearProject", clearProject);
Cypress.Commands.add("clearAssets", clearAssets);
Cypress.Commands.add("clearCustomTypes", clearCustomTypes);
Cypress.Commands.add("clearSlices", clearSlices);
Cypress.Commands.add("removeTypes", removeTypes);
Cypress.Commands.add("modifyFile", modifyFile);

/* -- CUSTOM TYPES */
Cypress.Commands.add("createCustomType", createCustomType);
Cypress.Commands.add("renameCustomType", renameCustomType);
Cypress.Commands.add("addFieldToCustomType", addFieldToCustomType);
Cypress.Commands.add(
  "saveCustomTypeModifications",
  saveCustomTypeModifications
);
Cypress.Commands.add("addSlicesToCustomType", addSlicesToCustomType);

/* -- SLICES -- */
Cypress.Commands.add("createSlice", createSlice);
Cypress.Commands.add("renameSlice", renameSlice);
Cypress.Commands.add("addStaticFieldToSlice", addStaticFieldToSlice);
Cypress.Commands.add("addRepeatableFieldToSlice", addRepeatableFieldToSlice);
Cypress.Commands.add("saveSliceModifications", saveSliceModifications);

/* REPOSITORY */
Cypress.Commands.add("pushLocalChanges", pushLocalChanges);

/* -- QUERIES -- */
Cypress.Commands.add("getInputByLabel", (label) => {
  return cy
    .contains("label", label)
    .invoke("attr", "for")
    .then((id) => {
      const selector = `[id="${id}"],[name="${id}"]`;
      return cy.get(selector);
    });
});
