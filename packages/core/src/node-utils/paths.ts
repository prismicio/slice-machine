import path from "path";
import * as os from "os";

export interface FileContent<T, E = void> {
  exists: boolean;
  content: T | null;
  errors?: E;
}

export interface Paths {
  value: () => string;
  customType: (id: string) => {
    value: () => string;
    model: () => string;
    types: () => string;
    mock: () => string;
  };
  library: (libraryName: string) => {
    value: () => string;
    slice: (sliceName: string) => {
      value: () => string;
      preview: (filename?: string) => string;
      stories: (filename?: string) => string;
      mocks: () => string;
      model: () => string;
      types: () => string;
      variation: (variationId: string) => {
        value: () => string;
        preview: (filename?: string) => string;
      };
    };
  };
}

const Paths = (cwd: string, prefix: string): Paths => ({
  value: () => path.join(cwd, prefix),
  customType: (id: string) => ({
    value: () => path.join(Paths(cwd, prefix).value()),
    model: () => path.join(Paths(cwd, prefix).value(), id, "index.json"),
    types: () => path.join(Paths(cwd, prefix).value(), id, "types.ts"),
    mock: () => path.join(Paths(cwd, prefix).value(), id, "mocks.json"),
  }),
  library: (libraryName: string) => ({
    value: () => path.join(Paths(cwd, prefix).value(), libraryName),
    slice: (sliceName: string) => ({
      value: () =>
        path.join(Paths(cwd, prefix).library(libraryName).value(), sliceName),
      preview: (filename = "preview.png") =>
        path.join(
          Paths(cwd, prefix).library(libraryName).slice(sliceName).value(),
          filename
        ),
      stories: (filename = "index.stories.js") =>
        path.join(
          Paths(cwd, prefix).library(libraryName).slice(sliceName).value(),
          filename
        ),
      mocks: () =>
        path.join(
          Paths(cwd, prefix).library(libraryName).slice(sliceName).value(),
          "mocks.json"
        ),
      model: () =>
        path.join(
          Paths(cwd, prefix).library(libraryName).slice(sliceName).value(),
          "model.json"
        ),
      types: () =>
        path.join(
          Paths(cwd, prefix).library(libraryName).slice(sliceName).value(),
          "types.ts"
        ),
      variation: (variationId: string) => ({
        value: () =>
          path.join(
            Paths(cwd, prefix).library(libraryName).slice(sliceName).value(),
            variationId
          ),
        preview: (filename = "preview.png") =>
          path.join(
            Paths(cwd, prefix)
              .library(libraryName)
              .slice(sliceName)
              .variation(variationId)
              .value(),
            filename
          ),
      }),
    }),
  }),
});

export const GeneratedPaths = (cwd: string): Paths =>
  Paths(cwd, path.join(".slicemachine", "assets"));
export const GeneratedCustomTypesPaths = (cwd: string): Paths =>
  Paths(cwd, path.join(".slicemachine", "assets", "customtypes"));
export const CustomTypesPaths = (cwd: string): Paths =>
  Paths(cwd, "customtypes");
export const CustomPaths = (cwd: string): Paths => Paths(cwd, "");
export const PackagePaths = (cwd: string): Paths => Paths(cwd, "node_modules");
export const SMConfigPath = (cwd: string): string => path.join(cwd, "sm.json");
export const LibrariesStatePath = (cwd: string): string =>
  path.join(cwd, ".slicemachine", "libraries-state.json");

export const PrismicConfigPath = path.join(os.homedir(), ".prismic");

export const SliceTemplateConfigPath = (
  cwd: string,
  customPathToTemplate?: string
): string =>
  customPathToTemplate
    ? path.join(cwd, customPathToTemplate)
    : path.join(cwd, "slice-template");

export const JsonPackagePath = (cwd: string): string =>
  path.join(cwd, "package.json");
export const YarnLockPath = (cwd: string): string =>
  path.join(cwd, "yarn.lock");
export const MocksConfigPath = (cwd: string): string =>
  path.join(cwd, ".slicemachine", "mock-config.json");
