import {
  CUSTOM_TYPES_FOLDER,
  ASSETS_FOLDER,
  SLICES_FOLDER,
  TYPES_FILE,
} from "../consts";

/**
 * Clean the project from all files that could have been created by Slice Machine.
 */
export function clearProject() {
  clearCustomTypes();
  clearSlices();
  clearAssets();
}

/**
 * Clean the custom type folder of the project.
 */
export function clearCustomTypes() {
  cy.task("clearDir", CUSTOM_TYPES_FOLDER);
}

/**
 * Clean the slice folder of the project.
 */
export function clearSlices() {
  cy.task("clearDir", SLICES_FOLDER);
}

/**
 * Clean the .slicemachine folder of the project.
 */
export function clearAssets() {
  cy.task("clearDir", ASSETS_FOLDER);
}

/**
 * Remove the types file.
 */
export function removeTypes() {
  cy.task("rmrf", TYPES_FILE);
}

/**
 * Modify file content.
 * @param {string} filePath Path of the file to modify.
 * @param {(content: any) => any} updateContent Function to update the content of the file.
 */
export function modifyFile(filePath, updateContent) {
  cy.readFile(filePath).then((content) =>
    cy.writeFile(filePath, updateContent(content))
  );
}
