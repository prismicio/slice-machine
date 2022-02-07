import path from "path";

export const paths = (cwd: string, prefix: string) => ({
  value: (): string => path.join(cwd, prefix),
  customType: (id: string) => ({
    value: (): string => path.join(paths(cwd, prefix).value()),
    model: (): string =>
      path.join(paths(cwd, prefix).value(), id, "index.json"),
    mock: (): string => path.join(paths(cwd, prefix).value(), id, "mocks.json"),
  }),
  library: (libraryName: string) => ({
    value: (): string => path.join(paths(cwd, prefix).value(), libraryName),
    slice: (sliceName: string) => ({
      value: (): string =>
        path.join(paths(cwd, prefix).library(libraryName).value(), sliceName),
      preview: (filename = "preview.png"): string =>
        path.join(
          paths(cwd, prefix).library(libraryName).slice(sliceName).value(),
          filename
        ),
      stories: (filename = "index.stories.js"): string =>
        path.join(
          paths(cwd, prefix).library(libraryName).slice(sliceName).value(),
          filename
        ),
      mocks: (): string =>
        path.join(
          paths(cwd, prefix).library(libraryName).slice(sliceName).value(),
          "mocks.json"
        ),
      model: (): string =>
        path.join(
          paths(cwd, prefix).library(libraryName).slice(sliceName).value(),
          "model.json"
        ),
      variation: (variationId: string) => ({
        value: (): string =>
          path.join(
            paths(cwd, prefix).library(libraryName).slice(sliceName).value(),
            variationId
          ),
        preview: (filename = "preview.png"): string =>
          path.join(
            paths(cwd, prefix)
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

// eslint-disable-next-line @typescript-eslint/ban-types
export const GeneratedPaths = (cwd: string): Record<string, Function> =>
  paths(cwd, path.join(".slicemachine", "assets"));
export const GeneratedCustomTypesPaths = (
  cwd: string
  // eslint-disable-next-line @typescript-eslint/ban-types
): Record<string, Function> =>
  paths(cwd, path.join(".slicemachine", "assets", "customtypes"));
// eslint-disable-next-line @typescript-eslint/ban-types
export const CustomTypesPaths = (cwd: string): Record<string, Function> =>
  paths(cwd, "customtypes");
// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/ban-types
export const CustomPaths = (cwd: string) => paths(cwd, "");
// eslint-disable-next-line @typescript-eslint/ban-types
export const PackagePaths = (cwd: string): Record<string, Function> =>
  paths(cwd, "node_modules");
export const LibrariesStatePath = (cwd: string): string =>
  path.join(cwd, ".slicemachine", "libraries-state.json");
export const PrismicConfig = (cwd: string): string =>
  path.join(cwd, ".prismic");
// This function is used in the changelog/migrate.js / don't remove it
export const SMConfig = (cwd: string): string => path.join(cwd, "sm.json");
export const SliceTemplateConfig = (
  cwd: string,
  customPathToTemplate?: string
): string =>
  customPathToTemplate
    ? path.join(cwd, customPathToTemplate)
    : path.join(PrismicConfig(cwd), "slice-template");
export const Pkg = (cwd: string): string => path.join(cwd, "package.json");
export const YarnLock = (cwd: string): string => path.join(cwd, "yarn.lock");
export const MocksConfig = (cwd: string): string =>
  path.join(cwd, ".slicemachine", "mock-config.json");
