import { customTypesFolder, assetsFolder, slicesFolder, typesFile } from "../consts";

export function clearProject() {
  clearCustomTypes()
  clearSlices()
  clearAssets()
}

export function clearCustomTypes() {
  cy.task("clearDir", customTypesFolder);
}

export function clearSlices() {
  cy.task("clearDir", slicesFolder);
}

export function clearAssets() {
  cy.task("clearDir", assetsFolder);
}

export function removeTypes() {
  cy.task("rmrf", typesFile);
}
