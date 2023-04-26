import path from "path";

export const ROOT = "e2e-projects/cypress-next-app";

export const PACKAGE_JSON_FILE = `${ROOT}/package.json`;
export const MANIFEST_FILE = `${ROOT}/slicemachine.config.json`;

export const ASSETS_FOLDER = `${ROOT}/.slicemachine`;
export const TYPES_FILE = `${ROOT}/prismicio-types.d.ts`;

export const CUSTOM_TYPES_FOLDER = `${ROOT}/customtypes`;
export const CUSTOM_TYPE_MODEL = (customTypeId) =>
  `${CUSTOM_TYPES_FOLDER}/${customTypeId}/index.json`;

export const SLICES_FOLDER = `${ROOT}/slices`;
export const SLICE_MOCK_FILE = (sliceName) =>
  `${SLICES_FOLDER}/${sliceName}/mocks.json`;

export const SLICE_MODEL = (sliceName) =>
  `${SLICES_FOLDER}/${sliceName}/model.json`;

export const SIMULATOR_PATH = path.join(ROOT, "pages", "slice-simulator.js");
