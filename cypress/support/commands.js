import * as localStorageHelpers from "../helpers/localStorage";
import * as filesystemHelpers from "../helpers/filesystem";
import * as customTypesHelpers from "../helpers/customTypes";
import * as slicesHelpers from "../helpers/slices";
import * as repositoryHelpers from "../helpers/repository";

/* -- LOCAL STORAGE -- */
Object.keys(localStorageHelpers).forEach((localStorageHelper) => {
  Cypress.Commands.add(
    localStorageHelper,
    localStorageHelpers[localStorageHelper]
  );
});

/* -- PROJECT RESET -- */
Object.keys(filesystemHelpers).forEach((filesystemHelper) => {
  Cypress.Commands.add(filesystemHelper, filesystemHelpers[filesystemHelper]);
});

/* -- CUSTOM TYPES */
Object.keys(customTypesHelpers).forEach((customTypesHelper) => {
  Cypress.Commands.add(
    customTypesHelper,
    customTypesHelpers[customTypesHelper]
  );
});

/* -- SLICES -- */
Object.keys(slicesHelpers).forEach((slicesHelper) => {
  Cypress.Commands.add(slicesHelper, slicesHelpers[slicesHelper]);
});

/* REPOSITORY */
Object.keys(repositoryHelpers).forEach((repositoryHelper) => {
  Cypress.Commands.add(repositoryHelper, repositoryHelpers[repositoryHelper]);
});

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
