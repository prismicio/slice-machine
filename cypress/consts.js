export const ROOT = "e2e-projects/cypress-next-app";

export const PACKAGE_JSON_FILE = `${ROOT}/package.json`;
export const MANIFEST_FILE = `${ROOT}/sm.json`;

export const ASSETS_FOLDER = `${ROOT}/.slicemachine`;
export const TYPES_FILE = `${ASSETS_FOLDER}/prismicio.d.ts`;
export const SLICE_MOCK_FILE = (sliceName) =>
  `${ASSETS_FOLDER}/assets/slices/${sliceName}/mocks.json`;
export const LIBRARIY_STATE_FILE = `${ASSETS_FOLDER}/libraries-state.json`;

export const CUSTOM_TYPES_FOLDER = `${ROOT}/customtypes`;
export const CUSTOM_TYPE_MODEL = (customTypeId) =>
  `${CUSTOM_TYPES_FOLDER}/${customTypeId}/index.json`;

export const SLICES_FOLDER = `${ROOT}/slices`;
export const SLICE_MODEL = (sliceName) =>
  `${SLICES_FOLDER}/${sliceName}/model.json`;
