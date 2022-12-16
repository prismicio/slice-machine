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
} from "../helpers/customTypes";
import { createSlice, renameSlice } from "../helpers/slices";

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

/* -- SLICES -- */
Cypress.Commands.add("createSlice", createSlice);
Cypress.Commands.add("renameSlice", renameSlice);
