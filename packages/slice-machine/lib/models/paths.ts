import path from "path";

export const paths = (
  cwd: string,
  prefix: string
): Record<string, Function> => ({
  value: () => path.join(cwd, prefix),
  customType: (id: string) => ({
    value: () => path.join(paths(cwd, prefix).value()),
    model: () => path.join(paths(cwd, prefix).value(), id, "index.json"),
    mock: () => path.join(paths(cwd, prefix).value(), id, "mocks.json"),
  }),
  library: (libraryName: string): Record<string, Function> => ({
    value: () => path.join(paths(cwd, prefix).value(), libraryName),
    slice: (sliceName: string) => ({
      value: () =>
        path.join(paths(cwd, prefix).library(libraryName).value(), sliceName),
      preview: (filename = "preview.png") =>
        path.join(
          paths(cwd, prefix).library(libraryName).slice(sliceName).value(),
          filename
        ),
      stories: (filename = "index.stories.js") =>
        path.join(
          paths(cwd, prefix).library(libraryName).slice(sliceName).value(),
          filename
        ),
      mocks: () =>
        path.join(
          paths(cwd, prefix).library(libraryName).slice(sliceName).value(),
          "mocks.json"
        ),
      model: () =>
        path.join(
          paths(cwd, prefix).library(libraryName).slice(sliceName).value(),
          "model.json"
        ),
      variation: (variationId: string) => ({
        value: () =>
          path.join(
            paths(cwd, prefix).library(libraryName).slice(sliceName).value(),
            variationId
          ),
        preview: (filename = "preview.png") =>
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

export const GeneratedPaths = (cwd: string): Record<string, Function> =>
  paths(cwd, path.join(".slicemachine", "assets"));
export const GeneratedCustomTypesPaths = (
  cwd: string
): Record<string, Function> =>
  paths(cwd, path.join(".slicemachine", "assets", "customtypes"));
export const CustomTypesPaths = (cwd: string): Record<string, Function> =>
  paths(cwd, "customtypes");
export const CustomPaths = (cwd: string): Record<string, Function> =>
  paths(cwd, "");
export const PackagePaths = (cwd: string): Record<string, Function> =>
  paths(cwd, "node_modules");
export const SMConfig = (cwd: string): string => path.join(cwd, "sm.json");
export const SliceCanvasStatePath = (cwd: string): string =>
  path.join(cwd, ".slicemachine", "slice-canvas.state.json");
export const PrismicConfig = (cwd: string): string =>
  path.join(cwd, ".prismic");
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
