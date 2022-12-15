import {
  CUSTOM_TYPES_FOLDER,
  ASSETS_FOLDER,
  SLICES_FOLDER,
  TYPES_FILE,
} from "../consts";

export function clearProject() {
  clearCustomTypes();
  clearSlices();
  clearAssets();
}

export function clearCustomTypes() {
  cy.task("clearDir", CUSTOM_TYPES_FOLDER);
}

export function clearSlices() {
  cy.task("clearDir", SLICES_FOLDER);
}

export function clearAssets() {
  cy.task("clearDir", ASSETS_FOLDER);
}

export function removeTypes() {
  cy.task("rmrf", TYPES_FILE);
}

export function modifyFile(filePath, updateContent /* (content) => content */) {
  cy.readFile(filePath).then((content) =>
    cy.writeFile(filePath, updateContent(content))
  );
}
