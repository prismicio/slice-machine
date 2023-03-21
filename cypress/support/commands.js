import * as localStorageHelpers from "../helpers/localStorage";
import * as filesystemHelpers from "../helpers/filesystem";
import * as customTypesHelpers from "../helpers/customTypes";
import * as slicesHelpers from "../helpers/slices";
import * as repositoryHelpers from "../helpers/repository";
import * as imageHelpers from "../helpers/images";

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

/* IMAGES */
Object.keys(imageHelpers).forEach((imageHelper) => {
  Cypress.Commands.add(
    imageHelper,
    { prevSubject: true },
    imageHelpers[imageHelper]
  );
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

// The current cy.reload() always fails because it never receives a load event.
Cypress.Commands.overwrite("reload", () => {
  return cy.url().then((url) => {
    cy.visit(url);
  });
});
