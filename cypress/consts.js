export const root = "e2e-projects/cypress-next-app";

export const packageJsonFile = `${root}/package.json`;
export const manifestFile = `${root}/sm.json`;

export const assetsFolder = `${root}/.slicemachine`;
export const typesFile = `${assetsFolder}/prismicio.d.ts`;
export const sliceMockFile = (sliceName) =>
  `${assetsFolder}/assets/slices/${sliceName}/mocks.json`;
export const libraryStateFile = `${assetsFolder}/libraries-state.json`;

export const customTypesFolder = `${root}/customtypes`;
export const slicesFolder = `${root}/slices`;
